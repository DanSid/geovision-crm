import React, { useEffect } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import AuthRoutes from './routes/AuthRoutes';
import ScrollToTop from './utils/ScrollToTop';
import IndexRoute from './routes';
import { initApp } from './redux/action/Crm';
import { syncSupabaseSession } from './redux/action/Auth';

// Protected route — redirects to login if not authenticated
const ProtectedRoute = ({ component: Component, isAuthenticated, ...rest }) => (
    <Route
        {...rest}
        render={(props) =>
            isAuthenticated
                ? <Component {...props} />
                : <Redirect to={{ pathname: '/auth/login', state: { from: props.location } }} />
        }
    />
);

function App({ isAuthenticated, initApp, syncSupabaseSession }) {
    useEffect(() => {
        syncSupabaseSession(); // restore Supabase session → Redux on page refresh
        initApp();             // hydrate CRM data from Supabase
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <BrowserRouter>
            <ScrollToTop>
                <Switch>
                    {/* Default redirect */}
                    <Route exact path="/" render={() =>
                        isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/auth/login" />
                    } />
                    {/* Auth routes (login, signup, etc.) */}
                    <Route path="/auth" render={(props) => <AuthRoutes {...props} />} />
                    {/* Protected app routes */}
                    <ProtectedRoute
                        path="/"
                        isAuthenticated={isAuthenticated}
                        component={IndexRoute}
                    />
                </Switch>
            </ScrollToTop>
        </BrowserRouter>
    );
}

const mapStateToProps = ({ auth }) => ({ isAuthenticated: auth.isAuthenticated });
export default connect(mapStateToProps, { initApp, syncSupabaseSession })(App);
