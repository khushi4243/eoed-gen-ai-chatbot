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
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#d1e3f0', textAlign: 'center' }}>
          Welcome to BEACON AI
        </div>
        <p style={{ fontSize: '20px', color: '#d1e3f0', margin: '10px 0' }}>
          An powered AI knowledge base able to answer any questions regarding resources in the
          Executive Office of Economic Development.
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
            Input information regarding businesses to receive grants, programs, and other incentives
            the business might be eligible for.
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
            An open ended chatbot to answer any inquiries regarding informational resources 
            and helpful contacts within the Executive Office of Economic Development.
          </p>
        </div>
      </div>
    </div>
  );
}
