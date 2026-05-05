# ADR-0001: Admin-only Competition Creation

## Status
Accepted

## Context
In most SaaS platforms, any authenticated user can create the top-level resource (here: a Competition). The alternative is restricting creation to a privileged system-level Admin role.

## Decision
Only system Admins can create Competitions. Regular users cannot self-register a Competition.

## Consequences
- **Quality control**: Every Competition on the platform has been deliberately created by a trusted Admin, reducing spam or half-finished events visible to athletes.
- **Operational bottleneck**: Scaling to many organizers requires Admin involvement for each new competition. This is acceptable for MVP where the operator controls the platform.
- **Role model clarity**: "Organizer" remains a per-Competition permission granted by an Admin, not a self-service account type.
