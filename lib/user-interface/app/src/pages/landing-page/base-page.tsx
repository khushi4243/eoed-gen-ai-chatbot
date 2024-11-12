import { Container, SpaceBetween, Header, Link, Icon } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Container>
      <Header variant="h1" style={{ fontSize: '40px', textAlign: 'center', margin: '20px 0' }}>
        Welcome to GrantWell
      </Header>

      <p style={{ fontSize: '18px', textAlign: 'center', margin: '10px 0 40px' }}>
        Choose an option to get started:
      </p>

      <SpaceBetween size="l" direction="horizontal" style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            textAlign: 'center',
            cursor: 'pointer',
            padding: '20px',
            borderRadius: '10px',
            backgroundColor: '#e1e4e8',
            width: '250px',
          }}
          onClick={() => handleNavigate('/chatbot')}
        >
          <Icon name="document" size="large" />
          <h2>Resource Track</h2>
          <p>Explore resources and tools for managing your funding opportunities.</p>
        </div>

        <div
          style={{
            textAlign: 'center',
            cursor: 'pointer',
            padding: '20px',
            borderRadius: '10px',
            backgroundColor: '#e1e4e8',
            width: '250px',
          }}
          onClick={() => handleNavigate('/chatbot')}
        >
          <Icon name="support" size="large" />
          <h2>Inquiries Track</h2>
          <p>Reach out for support or learn more about our services.</p>
        </div>
      </SpaceBetween>
    </Container>
  );
}
