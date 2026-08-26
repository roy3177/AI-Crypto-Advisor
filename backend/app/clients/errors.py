"""
Provider-agnostic error categories.

Clients raise these instead of letting a raw `httpx` exception or an
arbitrary provider status code leak into the service layer -- the service
only needs to know "timeout", "rate limited", "unauthorized", "bad
response", or "unavailable", not which HTTP library was used.
"""


class ProviderError(Exception):
    """Base class for all provider-client errors."""


class ProviderTimeoutError(ProviderError):
    pass


class ProviderRateLimitedError(ProviderError):
    pass


class ProviderUnauthorizedError(ProviderError):
    pass


class ProviderBadResponseError(ProviderError):
    pass


class ProviderUnavailableError(ProviderError):
    pass
