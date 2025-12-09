#!/bin/sh
# Docker entrypoint script to handle database URL transformation
# Replaces localhost/127.0.0.1 with host.docker.internal in database URLs

# Transform DATABASE_URL_RW if it contains localhost or 127.0.0.1
if [ -n "$DATABASE_URL_RW" ]; then
  # Replace @localhost: or @127.0.0.1: with @host.docker.internal: in connection string
  export DATABASE_URL_RW=$(echo "$DATABASE_URL_RW" | sed 's/@localhost:/@host.docker.internal:/g')
  export DATABASE_URL_RW=$(echo "$DATABASE_URL_RW" | sed 's/@127\.0\.0\.1:/@host.docker.internal:/g')
  # Also handle cases without port (though less common)
  export DATABASE_URL_RW=$(echo "$DATABASE_URL_RW" | sed 's/localhost$/host.docker.internal/g')
  export DATABASE_URL_RW=$(echo "$DATABASE_URL_RW" | sed 's/127\.0\.0\.1$/host.docker.internal/g')
fi

# Transform DATABASE_URL if it contains localhost or 127.0.0.1
if [ -n "$DATABASE_URL" ]; then
  # Replace @localhost: or @127.0.0.1: with @host.docker.internal: in connection string
  export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/@localhost:/@host.docker.internal:/g')
  export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/@127\.0\.0\.1:/@host.docker.internal:/g')
  # Also handle cases without port (though less common)
  export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/localhost$/host.docker.internal/g')
  export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/127\.0\.0\.1$/host.docker.internal/g')
fi

# Execute the main command
exec "$@"

