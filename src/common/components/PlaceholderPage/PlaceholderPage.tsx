const PlaceholderPage = ({ title }: { title: string }) => {
    return (
        <div className="placeholder-page" style={{ paddingBottom: '80px' }}>
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '70vh',
                textAlign: 'center',
                padding: '24px'
            }}>
                <div style={{ 
                    width: '120px', 
                    height: '120px', 
                    backgroundColor: '#fff4ed', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '20px'
                }}>
                    <span style={{ fontSize: '40px' }}>🚀</span>
                </div>
                <h2 style={{ color: '#333', marginBottom: '12px' }}>Tính năng {title}</h2>
                <p style={{ color: '#666', maxWidth: '300px' }}>
                    Tính năng này đang được phát triển và sẽ sớm ra mắt trong phiên bản tới!
                </p>
            </div>
        </div>
    );
};

export default PlaceholderPage;
