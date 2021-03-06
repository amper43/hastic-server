import config
import detectors
import logging
import pandas as pd
from typing import Optional
from models import AnalyticUnitCache
from concurrent.futures import Executor, CancelledError
import asyncio

logger = logging.getLogger('AnalyticUnitWorker')


class AnalyticUnitWorker:

    def __init__(self, analytic_unit_id: str, detector: detectors.Detector, executor: Executor):
        self.analytic_unit_id = analytic_unit_id
        self._detector = detector
        self._executor: Executor = executor
        self._training_feature: asyncio.Future = None

    async def do_train(
        self, segments: list, data: pd.DataFrame, cache: Optional[AnalyticUnitCache]
    ) -> AnalyticUnitCache:
        self._training_feature = asyncio.get_event_loop().run_in_executor(
            self._executor, self._detector.train, data, segments, cache
        )
        try:
            new_cache: AnalyticUnitCache = await self._training_feature
            return new_cache
        except CancelledError as e:
            return cache

    async def do_detect(self, data: pd.DataFrame, cache: Optional[AnalyticUnitCache]) -> dict:
        return self._detector.detect(data, cache)

    def cancel(self):
        if self._training_feature is not None:
            self._training_feature.cancel()
