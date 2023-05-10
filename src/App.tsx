import './App.css';
import Sudoku from './components/Sudoku';

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Sudoku />
    </div>
  );
}

export default App;
