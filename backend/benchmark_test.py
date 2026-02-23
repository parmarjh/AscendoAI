import asyncio
import time
import httpx
import statistics
import traceback

# Configuration
# Use 127.0.0.1 explicitly to avoid localhost resolution issues
API_URL = "http://127.0.0.1:8000"
NUM_REQUESTS = 100
CONCURRENT_REQUESTS = 10

async def fetch(client):
    start_time = time.time()
    try:
        response = await client.get(f"{API_URL}/") # Health check endpoint
        end_time = time.time()
        return end_time - start_time, response.status_code
    except Exception as e:
        # Create a simplified error string
        error_msg = str(e) or "Unknown Error"
        print(f"Request failed: {error_msg}")
        return None, None

async def run_benchmark():
    print(f"🚀 Starting Benchmark: {NUM_REQUESTS} requests to {API_URL}...")
    
    # Increase timeout to handle potential initial slow responses
    timeout = httpx.Timeout(10.0, connect=10.0)
    
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            # First, check if server is reachable with a single request
            print("Pinging server...")
            resp = await client.get(f"{API_URL}/")
            if resp.status_code == 200:
                print("✅ Server is reachable. Starting load test...")
            else:
                 print(f"⚠️ Server returned status {resp.status_code}. Proceeding anyway...")
        except Exception as e:
            print(f"❌ Server unreachable at {API_URL}. Is it running?")
            print(f"Error details: {e}")
            return

        tasks = [fetch(client) for _ in range(NUM_REQUESTS)]
        results = await asyncio.gather(*tasks)

    # Process results
    times = [r[0] for r in results if r[0] is not None]
    success_count = len([r for r in results if r[1] == 200])
    
    if not times:
        print("❌ All benchmark requests failed.")
        return

    avg_time = statistics.mean(times)
    median_time = statistics.median(times)
    max_time = max(times)
    min_time = min(times)
    
    # Calculate simulated "F1 Score" for reliability
    precision = success_count / NUM_REQUESTS
    recall = success_count / NUM_REQUESTS
    f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

    print("\n📊 Benchmark Results:")
    print(f"✅ Successful Requests: {success_count}/{NUM_REQUESTS}")
    print(f"⏱️  Average Latency:   {avg_time*1000:.2f} ms")
    print(f"⏱️  Median Latency:    {median_time*1000:.2f} ms")
    print(f"⚡ Min Latency:       {min_time*1000:.2f} ms")
    print(f"🐢 Max Latency:       {max_time*1000:.2f} ms")
    print(f"🎯 Reliability Score (F1): {f1_score:.4f}")

if __name__ == "__main__":
    asyncio.run(run_benchmark())
