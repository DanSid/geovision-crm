import classNames from 'classnames'
import { AnimatePresence } from '../utils/motion-shim.jsx'
import React, { Suspense } from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import PageAnimate from '../components/Animation/PageAnimate'
import { authRoutes } from './AuthList'

const ClassicRoutes = (props) => {

    const { match } = props;

    const lockScreenAuth = useRouteMatch("/auth/lock-screen");

    return (
        <>
            <AnimatePresence>
                <Suspense
                    fallback={
                        <div className="preloader-it">
                            <div className="loader-pendulums" />
                        </div>
                    }>
                    <div className={classNames("hk-wrapper hk-pg-auth", { "bg-primary-dark-3": lockScreenAuth })} data-footer="simple" >
                        <Switch>

                            {
                                authRoutes.map((obj, i) => {
                                    return (obj.component) ? (
                                        <Route
                                            key={i}
                                            exact={obj.exact}
                                            path={match.path + obj.path}
                                            render={matchProps => (
                                                <>
                                                    <PageAnimate>
                                                        <obj.component {...matchProps} />
                                                    </PageAnimate>

                                                </>
                                            )}
                                        />) : (null)
                                })
                            }
                            {/* <Redirect exact from='/' to='/dashboard' /> */}
                        </Switch>
                    </div>
                </Suspense>
            </AnimatePresence>
        </>
    )
}

export default ClassicRoutes
