import uuid
import asyncio
from typing import Dict, Any, Optional

class JobManager:
    def __init__(self):
        self.jobs: Dict[str, Dict[str, Any]] = {}

    def create_job(self) -> str:
        job_id = str(uuid.uuid4())
        self.jobs[job_id] = {
            "status": "pending",
            "progress": 0,
            "total": 0,
            "data": None,
            "error": None,
            "cancel_event": asyncio.Event()
        }
        return job_id

    def update_progress(self, job_id: str, progress: int):
        if job_id in self.jobs:
            self.jobs[job_id]["progress"] = progress

    def set_total(self, job_id: str, total: int):
         if job_id in self.jobs:
            self.jobs[job_id]["total"] = total

    def complete_job(self, job_id: str, data: Any):
        if job_id in self.jobs:
            self.jobs[job_id]["status"] = "completed"
            self.jobs[job_id]["progress"] = 100
            self.jobs[job_id]["data"] = data

    def fail_job(self, job_id: str, error: str):
        if job_id in self.jobs:
            self.jobs[job_id]["status"] = "failed"
            self.jobs[job_id]["error"] = error

    def cancel_job(self, job_id: str):
        if job_id in self.jobs:
            self.jobs[job_id]["status"] = "cancelled"
            self.jobs[job_id]["cancel_event"].set()

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        return self.jobs.get(job_id)

    async def check_cancellation(self, job_id: str):
        job = self.jobs.get(job_id)
        if job and job["cancel_event"].is_set():
            raise asyncio.CancelledError("Job was cancelled by user")

job_manager = JobManager()