import { Link } from 'react-router-dom';
import Section from './components/shared/section/section';

function App() {
  return (
    <Section>
      <h1>Taskly</h1>
      <Link to="/login">Get Started</Link>
    </Section>
  );
}
export default App;