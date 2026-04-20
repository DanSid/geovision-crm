import React, { Suspense } from 'react';
// import { AnimatePresence } from 'framer-motion';
import { Redirect, Route, Switch } from 'react-router-dom';
// import PageAnimate from '../components/Animation/PageAnimate';
import CompactLayout from '../layout/MainLayout/index';
import { routes } from './RouteList'

const IndexRoute = (props) => {

    const { match } = props;

    return (
        <>
            {/* <AnimatePresence> */}
                <Suspense
                    fallback={
                        <div className="preloader-it">
                            <div className="loader-pendulums" />
                        </div>
                    }>
                    <CompactLayout>
                        <Switch>

                            {
                                routes.map((obj, i) => {
                                    return (obj.component) ? (
                                        <Route
                                            key={i}
                                            exact={obj.exact}
                                            path={match.path + obj.path}
                                            render={matchProps => (
                                                <>
                                                    {/* <PageAnimate> */}
                                                        <obj.component {...matchProps} />
                                                    {/* </PageAnimate> */}

                                                </>
                                            )}
                                        />) : (null)
                                })
                            }
                            <Route path="*">
                                <Redirect to="/error-404" />
                            </Route>
                        </Switch>
                    </CompactLayout>
                </Suspense>
            {/* </AnimatePresence> */}
        </>
    )
}

export default IndexRoute
