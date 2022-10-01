build=builds/$(date "+%Y-%m-%d-%H%M%S").tar.gz
tar --exclude-from .bundleignore -czf $build --directory game .
echo Build created: $build