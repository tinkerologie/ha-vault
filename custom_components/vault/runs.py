"""Pick the right run of a job: backups for backup sensors, any run for activity.

A job's history mixes backup and restore runs. Backup sensors (status, last
run, size, success) must describe the latest backup, not a restore made from
it, while "is something running" covers both.
"""

from __future__ import annotations

from .api.models import JobRun, VaultApiData

RUN_TYPE_BACKUP = "backup"
RUN_TYPE_RESTORE = "restore"

# Enough history to find the latest backup behind a run of restores. The
# daemon's history endpoint can't filter by run type.
HISTORY_LIMIT = 25


def status_text(value: object) -> str:
    """Return normalized lowercase text for enum or string values."""
    return str(getattr(value, "value", value)).lower()


def run_type(run: JobRun) -> str:
    """Return the run's type; older daemons leave it empty for backups."""
    return status_text(run.run_type) or RUN_TYPE_BACKUP


def latest_backup_run(data: VaultApiData, job_id: int) -> JobRun | None:
    """Return the most recent backup run of a job, skipping restores."""
    return next((run for run in data.job_runs.get(job_id, []) if run_type(run) == RUN_TYPE_BACKUP), None)


def latest_finished_backup_run(data: VaultApiData, job_id: int) -> JobRun | None:
    """Return the most recent backup run that has finished."""
    return next(
        (
            run
            for run in data.job_runs.get(job_id, [])
            if run_type(run) == RUN_TYPE_BACKUP and status_text(run.status) != "running"
        ),
        None,
    )


def active_run(data: VaultApiData, job_id: int) -> JobRun | None:
    """Return the job's running run, backup or restore, if any."""
    runs = data.job_runs.get(job_id, [])
    if runs and status_text(runs[0].status) == "running":
        return runs[0]
    return None
