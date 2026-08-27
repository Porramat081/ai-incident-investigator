import time
import random
import requests
from datetime import datetime, timezone
from faker import Faker

fake = Faker()

TARGET_INGESTION_API = "http://localhost:3000/api/logs"
MICROSERVICES = ["AuthService","PaymentService","CartService","InventoryService","GatewayRouter"]

def stream_log_payload(service_name:str,log_level:str,raw_message:str,metadata:dict=None):
    payload = {
        "timestamp" : datetime.now(timezone.utc).isoformat(),
        "service_name":service_name,
        "log_level":log_level.upper(),
        "raw_message":raw_message,
        "metadata":metadata or {}
    }

    try:
        response = requests.post(TARGET_INGESTION_API,json=payload,timeout=2)
        if response.status_code == 201:
            print(f"📦 Log Streamed successfully -> [{log_level}] {service_name}: {raw_message[:50]}...")
        else:
            print(f"⚠️ Ingestion endpoint rejected package: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as error:
        print(f"❌ Network failure trying to connect to Ingestion API: {error}")

def simulate_happy_path_traffic():
    target_service = random.choice(MICROSERVICES)

    happy_messages = [
        f"User session validation passed for JWT profile token.",
        f"Query resolution completed successfully in {random.randint(5, 45)}ms.",
        f"Distributed Redis cache lookup hit completed.",
        f"Health-check heartbeat acknowledged by orchestration cluster.",
        f"Successfully read checkout basket cache inventory matrix parameters."
    ]

    stream_log_payload(target_service,"INFO",random.choice(happy_messages))

def inject_cascading_chaos_outage():
    print("\n🔥 [CHAOS MODE INJECTED] Beginning Infrastructure Failure Cascade Simulator...")
    time.sleep(1)

    print("-> Triggering Root Cause Event inside PaymentService...")
    stream_log_payload(
        service_name="PaymentService",
        log_level="WARN",
        raw_message="Connection pool utilization spiked radically (99/100 connections standard threshold limit reached)."
    )
    time.sleep(0.8)

    stream_log_payload(
        service_name="PaymentService",
        log_level="ERROR",
        raw_message="TimeoutException: Failed to acquire database connection client resource in 5000ms. Pool allocation completely exhausted.",
        metadata={
            "error_code": "ERR_DB_POOL_BLOCKED",
            "active_threads": 250,
            "traceback": "File 'services/payment/db_pool.py', line 114, in checkout_conn... Exception: ConnectionTimeout"
        }
    )
    time.sleep(1)

    print("-> Ripple effect rolling through CartService...")
    stream_log_payload(
        service_name="CartService",
        log_level="ERROR",
        raw_message="HTTP 500 Internal Server error returned during checkout compilation routing handling from downstream /api/v1/charge endpoint.",
        metadata={
            "failed_endpoint": "http://payment-service-cluster/api/v1/charge",
            "http_status_code": 500,
            "retry_attempt": 3
        }
    )
    time.sleep(0.5)

    print("-> Edge Gateway routing experiencing total degradation...")
    stream_log_payload(
        service_name="GatewayRouter",
        log_level="FATAL",
        raw_message="Circuit breaker tripped for payment paths. Shunting user checkout network streams to fallback failure views.",
        metadata={"circuit_state": "OPEN", "dropped_requests_count": 142}
    )
    print("✅ Chaos Sequence fully broadcasted to ingestion engine.\n")

if __name__ == "__main__":
    print("==================================================================")
    print("🚀 MOCK PRODUCTION ENVIRONMENT LOG STREAM ACTIVATED")
    print("   Streaming benign application rows every 1-2 seconds.")
    print("   Every 25 cycles, an architectural chaos outage is auto-injected!")
    print("   Press Ctrl+C inside this window to stop execution workflow.")
    print("==================================================================")

    cycle_counter = 0
    try:
        while True:
            cycle_counter += 1
            
            # Every 25 standard logs, automatically fire the chaos sequence
            if cycle_counter % 25 == 0:
                inject_cascading_chaos_outage()
                time.sleep(3) # Let the stream settle down after an outage event
            else:
                simulate_happy_path_traffic()
            
            # Pause randomly to look like variable live human user traffic patterns
            time.sleep(random.uniform(0.5, 2.0))
            
    except KeyboardInterrupt:
        print("\n⏹️ Log Streaming simulator stopped manually by developer process.")