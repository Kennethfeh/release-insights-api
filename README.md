# Release Insights API

Small Express service that exposes `/build-info` and `/healthz` so CI/CD systems, dashboards, and runtime probes can read deployment metadata. Provides a simple JSON contract for commit IDs, versions, and rollout timestamps.

## Endpoints

| Path | Description |
| --- | --- |
| `GET /healthz` | Basic readiness probe used by Kubernetes, load balancers, or synthetic checks. |
| `GET /build-info` | Returns `{ service, commit, version, timestamp }` pulled from environment variables injected at deploy time. |

## Sample `/build-info` response

```json
{
  "service": "release-insights-api",
  "commit": "abc1234",
  "version": "2.3.1",
  "timestamp": "2024-05-10T12:44:01.001Z"
}
```

## Local development

```bash
npm install
npm run dev
curl http://localhost:4100/build-info
```

Override metadata to mimic a production release:

```bash
APP_VERSION=2.3.1 GIT_COMMIT=$(git rev-parse --short HEAD) npm run dev
```

## Testing & linting

- `npm run lint` enforces the StandardJS eslint ruleset.
- `npm test` uses the Node test runner + Supertest to verify the contract of `/build-info`.
- The `release_insights_api` job in `.github/workflows/portfolio.yml` installs dependencies, lints, tests, builds the Docker image, and leaves a placeholder for a container scan (Trivy, Grype, etc.).

## Docker & deployment

The multistage `Dockerfile` runs lint/tests before copying the code into a runtime image:

```bash
docker build -t release-insights-api:local .
docker run -p 4100:4100 -e APP_VERSION=1.4.0 -e GIT_COMMIT=abc123 release-insights-api:local
```

In Kubernetes or ECS, inject `APP_VERSION`, `GIT_COMMIT`, and `PORT` through environment variables so downstream dashboards always show the correct release metadata.

## Observability hand-off

- Ship `GET /build-info` responses to Grafana or Datadog dashboards to show which commit is serving traffic.
- Wire `/healthz` to your load balancers and uptime checks—no authentication is required so you can safely attach synthetic monitors.
- Extend this API with additional provenance (SBOM URLs, artifact digests) without changing clients; the JSON payload is intentionally namespaced.

## Use cases

- Deployment verification in Argo CD, Spinnaker, or GitHub Actions (compare `/build-info` to the desired commit SHA).
- Populate “What’s running in prod?” dashboards without granting cluster access to stakeholders.
- Power audit logs by storing `/build-info` responses whenever a release pipeline promotes a build.
