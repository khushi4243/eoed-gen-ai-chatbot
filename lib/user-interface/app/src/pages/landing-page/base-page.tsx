import { Container, SpaceBetween, Header, Icon } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Header variant="h2">Welcome to BEACON AI</Header>
  )

//   return (
//     <Container>
//       <div style={{ textAlign: 'center', margin: '20px 0' }}>
//         <Header variant="h2">Welcome to BEACON AI</Header>
//       </div>

//       <p style={{ fontSize: '18px', textAlign: 'center', margin: '10px 0 40px' }}>
//         Choose an option to get started:
//       </p>

//       <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
//         <div
//           style={{
//             textAlign: 'center',
//             cursor: 'pointer',
//             padding: '20px',
//             borderRadius: '10px',
//             backgroundColor: '#e1e4e8',
//             width: '250px',
//           }}
//           onClick={() => handleNavigate('/chatbot')}
//         >
//           {/* <img src={`${process.env.PUBLIC_URL}/images/resources.png`} alt="Resource Icon" style={{ width: '50px', height: '50px' }} /> */}
//           <h2>Resource Track</h2>
//           <p>Explore resources and tools for managing your funding opportunities.</p>
//         </div>

//         <div
//           style={{
//             textAlign: 'center',
//             cursor: 'pointer',
//             padding: '20px',
//             borderRadius: '10px',
//             backgroundColor: '#e1e4e8',
//             width: '250px',
//           }}
//           onClick={() => handleNavigate('/chatbot')}
//         >
//           {/* <img src={`${process.env.PUBLIC_URL}/images/inquiries.png`} alt="Inquiries Icon" style={{ width: '50px', height: '50px' }} /> */}
//           <h2>Inquiries Track</h2>
//           <p>Reach out for support or learn more about our services.</p>
//         </div>
//       </div>
//     </Container>
//   );
// }
