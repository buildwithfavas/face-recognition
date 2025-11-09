import { Container } from 'react-bootstrap';
import Home from './pages/Home';

function App() {
  return (
    <Container fluid as="main" role="main" aria-label="Facial Recognition Application">
      <Home />
    </Container>
  );
}

export default App;
