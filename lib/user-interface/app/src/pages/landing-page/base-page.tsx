import { Container, Header, Icon } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleNavigate = () => {
    const newSessionId = uuidv4();
    navigate(`/chatbot/playground/${newSessionId}`);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0', backgroundColor: '#f5f7fa' }}>
      {/* Main Header */}
      <div style={{ textAlign: 'center', padding: '40px 0', backgroundColor: '#001f3f', color: 'white' }}>
        <Header variant="h1" className="main-header">
          Welcome to BEACON AI
        </Header>
        <p style={{ fontSize: '20px', color: '#d1e3f0', margin: '10px 0' }}>
          Empowering Massachusetts State Employees with AI Resources and Support
        </p>
      </div>

      {/* Subheading */}
      <div style={{ textAlign: 'center', padding: '20px', color: '#333', marginTop: '30px' }}>
        <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#001f3f' }}>
          Select an option below to get started:
        </p>
      </div>

      {/* Action Cards */}
      <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          marginTop: '20px',
          padding: '0 20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Resource Track */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '50px',
            borderRadius: '15px',
            backgroundColor: '#e8f0fa',
            width: '400px',
            minHeight: '350px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onClick={handleNavigate}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        >
          <Icon name="status-positive" size="large" />
          <h2 style={{ margin: '20px 0', color: '#001f3f', fontWeight: 'bold', fontSize: '28px' }}>
            Resource Track
          </h2>
          <p style={{ color: '#333', textAlign: 'center', fontSize: '18px', maxWidth: '300px' }}>
            Explore tools and resources for managing state funding opportunities and advancing Massachusetts communities.
          </p>
        </div>

        {/* Inquiries Track */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '50px',
            borderRadius: '15px',
            backgroundColor: '#e8f0fa',
            width: '400px',
            minHeight: '350px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onClick={handleNavigate}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        >
          <Icon name="status-info" size="large" />
          <h2 style={{ margin: '20px 0', color: '#001f3f', fontWeight: 'bold', fontSize: '28px' }}>
            Inquiries Track
          </h2>
          <p style={{ color: '#333', textAlign: 'center', fontSize: '18px', maxWidth: '300px' }}>
            Reach out for support, guidance, and resources to help you make informed decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
