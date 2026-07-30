# LaunchOps

LaunchOps is an authenticated SaaS operations dashboard for technical founders and developers. It connects role-sensitive navigation, sample project records, activity, mocked integrations, verification states, and export readiness without claiming production telemetry.

## Stable routes

- `/launch-demo/launchops/auth`
- `/launch-demo/launchops`
- `/launch-demo/launchops/project`
- `/launch-demo/launchops/verification?tab=static`
- `/launch-demo/launchops/verification?tab=runtime`
- `/launch-demo/launchops/verification?tab=export`

Every route accepts `demoState=default|loading|error|empty|verified|mobile`. Add `demoControls=1` to reveal the fixture controller.

## Talking points

- Authentication is interactive but explicitly fixture-only.
- Owner, Developer, and Viewer roles change the available navigation.
- Search, status filtering, project drill-down, activity, and repository preview are interactive.
- Integrations are clearly marked as mocked and all data is deterministic sample data.
- Static, runtime, and export readiness remain separate evidence views.
