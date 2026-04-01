from pathlib import Path

# Allow `app.*` imports from the repository root by pointing this package
# at the actual FastAPI source directory under `backend/app`.
__path__ = [str(Path(__file__).resolve().parent.parent / "backend" / "app")]
