"""
In-memory store that holds uploaded DataFrames for the duration of the server session.
Each dataset is keyed by a UUID (dataset_id) returned at upload time.
Later phases (EDA, preprocessing, …) will reference the same dataset_id.
"""

import pandas as pd
from typing import Optional

_store: dict[str, pd.DataFrame] = {}


def save(dataset_id: str, df: pd.DataFrame) -> None:
    _store[dataset_id] = df


def load(dataset_id: str) -> Optional[pd.DataFrame]:
    return _store.get(dataset_id)


def delete(dataset_id: str) -> bool:
    if dataset_id in _store:
        del _store[dataset_id]
        return True
    return False


def list_ids() -> list[str]:
    return list(_store.keys())
