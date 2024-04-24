from asgiproxy.config import ProxyConfig, BaseURLProxyConfigMixin
from asgiproxy.context import ProxyContext
from asgiproxy.simple_proxy import make_simple_proxy_app
from starlette.types import ASGIApp
from urllib.parse import urlparse


class SimpleProxyConfig(BaseURLProxyConfigMixin, ProxyConfig):
    def __init__(self, url):
        self.upstream_base_url = url
        self.rewrite_host_header = urlparse(url).netloc

def make_proxy(upstream_base_url: str) ->  ASGIApp:
    config = SimpleProxyConfig(upstream_base_url)
    proxy_context = ProxyContext(config)
    app = make_simple_proxy_app(proxy_context)
    return app


