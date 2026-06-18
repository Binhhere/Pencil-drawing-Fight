import { Game } from './game/Game';
import './styles.css';

const root = document.getElementById('app');
if (!root) throw new Error('#app is missing');

new Game(root).mount();
