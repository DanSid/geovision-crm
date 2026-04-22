import React, { Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CompactLayout from '../layout/MainLayout/index';
import { routes } from './RouteList';
import { getEffectivePermissions, isRouteAllowed } from '../utils/permissions';

/* ── Access Denied placeholder ─────────────────────────────────────────────── */
const AccessDenied = () => (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center" style={{ minHeight: '60vh' }}>
        <i className="ri-lock-2-line text-danger mb-3" style={{ fontSize: 48 }} />
        <h4 className="fw-bold mb-2">Access Denied</h4>
        <p className="text-muted mb-1">You don't have permission to view this section.</p>
        <p className="text-muted fs-7">Contact your administrator to request access.</p>
    </div>
);

/* ── Permission gate — wraps each rendered route ────────────────────────────── */
const PermissionGate = ({ pathname, children }) => {
    const auth        = useSelector(s => s.auth);
    const permissions = useSelector(s => s.permissions);
    const effectivePerms = getEffectivePermissions(auth.currentUser, permissions);

    if (!isRouteAllowed(pathname, effectivePerms)) {
        return <AccessDenied />;
    }
    return children;
};

/* ══════════════════════════════════════════════════════════════════════════════
   IndexRoute
══════════════════════════════════════════════════════════════════════════════ */
const IndexRoute = (props) => {
    const { match } = props;

    return (
        <Suspense
            fallback={
                <div className="preloader-it">
                    <div className="loader-pendulums" />
                </div>
            }
        >
            <CompactLayout>
                <Switch>
                    {routes.map((obj, i) => obj.component ? (
                        <Route
                            key={i}
                            exact={obj.exact}
                            path={match.path + obj.path}
                            render={matchProps => (
                                <PermissionGate pathname={matchProps.location.pathname}>
                                    <obj.component {...matchProps} />
                                </PermissionGate>
                            )}
                        />
                    ) : null)}

                    <Route path="*">
                        <Redirect to="/error-404" />
                    </Route>
                </Switch>
            </CompactLayout>
        </Suspense>
    );
};

export default IndexRoute;
