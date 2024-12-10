import { Container, Header, Icon } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function LandingPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleNavigateChatbot = () => {
    const newSessionId = uuidv4();
    navigate(`/chatbot/playground/${newSessionId}`);
  };

  const handleNavigateDropdown = () => {
    try {
      navigate('/resources-track/resources-page');
      setError(null); 
    } catch (err) {
      console.error("Navigation error:", err);
      setError("Failed to navigate to resources.");
    }
  };

  return (
    <div style={{ minHeight: '125vh', backgroundColor: '#f5f7fa' }}>
      {/* Main Header */} 
      <div style={{ 
        textAlign: 'center', 
        padding: '80px 0', 
        backgroundColor: '#001f3f', 
        color: 'white', 
        marginBottom: '40px',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '58px', fontWeight: 'bold', color: '#d1e3f0', textAlign: 'center' }}>
          Welcome to BEACON AI
        </div>
        <p style={{ fontSize: '20px', color: '#d1e3f0', margin: '10px 0' }}>
          Business Enhancement and Assistance Center for Optimized Navigation
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
          onClick={handleNavigateDropdown}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        >
          <Icon name="status-positive" size="large" />
          <h2 style={{ margin: '20px 0', color: '#001f3f', fontWeight: 'bold', fontSize: '28px' }}>
            Resources Finder
          </h2>
          <p style={{ color: '#333', textAlign: 'center', fontSize: '18px', maxWidth: '300px' }}>
            Enter business details to receive a list of Team MA incentives, loans, and other programs the business may qualify for.
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
          onClick={handleNavigateChatbot}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        >
          <Icon name="status-info" size="large" />
          <h2 style={{ margin: '20px 0', color: '#001f3f', fontWeight: 'bold', fontSize: '28px' }}>
            Chatbot
          </h2>
          <p style={{ color: '#333', textAlign: 'center', fontSize: '18px', maxWidth: '300px' }}>
            Ask the chatbot for suggestions on business resources or information available within the Executive Office of Economic Development, Team MA, and the Commonwealth of Massachusetts.
          </p>
        </div>
      </div>
    </div>
  );
}

