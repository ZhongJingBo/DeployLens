import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { routes } from '../config/routes';

// Direct imports for Chrome extension
export const AppRouter: React.FC = () => {
  return (
    <Switch>
      <Redirect from="/" to="/replace-link" exact />
      {routes.map(route => (
        <Route
          key={route.path}
          exact={route.path === '/'}
          path={route.path}
          component={route.component}
        />
      ))}
      <Redirect from="*" to="/replace-link" />
    </Switch>
  );
};
