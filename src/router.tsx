import { createHashRouter } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Home } from './pages/Home';
import { Arcade } from './pages/Arcade';
import { Scores } from './pages/Scores';
import { GamePage } from './pages/GamePage';

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'arcade', element: <Arcade /> },
      { path: 'scores', element: <Scores /> },
      { path: 'games/:gameId', element: <GamePage /> },
    ],
  },
]);
