import datetime as dt

from pydantic import BaseModel


class TempfileInfoSchema(BaseModel):
    filename: str
    expires_at: dt.datetime

    def is_expired(self, current_time: dt.datetime) -> bool:
        return current_time > self.expires_at


# class FileInfo(BaseModel):
#     """Информация о файле в реестре"""

#     file_id: str
#     original_name: str
#     created_at: dt.datetime
#     expires_at: dt.datetime
#     file_path: str
#     size_bytes: int | None = None

#     class Config:
#         json_encoders = {dt.datetime: lambda v: v.isoformat()}

#     @property
#     def is_expired(self) -> bool:
#         return dt.datetime.now() > self.expires_at

#     @property
#     def remaining_seconds(self) -> int:
#         delta = self.expires_at - dt.datetime.now()
#         return max(0, int(delta.total_seconds()))


# class FileInfo(BaseModel):
#     """Информация о файле в реестре"""

#     file_id: str
#     original_name: str
#     created_at: dt.datetime
#     expires_at: dt.datetime
#     file_path: str
#     size_bytes: int | None = None

#     class Config:
#         json_encoders = {dt.datetime: lambda v: v.isoformat()}

#     def is_expired(self, current_time: dt.datetime) -> bool:
#         """Проверяет, истек ли срок файла"""
#         return current_time > self.expires_at

#     def remaining_seconds(self, current_time: dt.datetime) -> int:
#         """Возвращает оставшееся время в секундах"""
#         delta = self.expires_at - current_time
#         return max(0, int(delta.total_seconds()))

#     def remaining_time(self, current_time: dt.datetime) -> dt.timedelta:
#         """Возвращает оставшееся время как timedelta"""
#         return max(dt.timedelta(0), self.expires_at - current_time)
