import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Card, 
  Avatar, 
  Descriptions, 
  Spin, 
  Typography, 
  Tag, 
  Space,
  Divider,
  Button,
  Row,
  Col,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  HomeOutlined,
  EditOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Lấy userId từ localStorage
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.warn("⚠️ Không tìm thấy userId trong localStorage");
      setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`http://localhost:9999/user/${userId}`);
        setUser(res.data);
      } catch (err) {
        console.error("❌ Không lấy được thông tin người dùng", err.message);
        setError("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'red';
      case 'manager': return 'orange';
      case 'user': return 'green';
      default: return 'default';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'manager': return 'Quản lý';
      case 'user': return 'Người dùng';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  if (!user) {
    return (
      <Card style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text type="secondary">Không tìm thấy thông tin người dùng</Text>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Header Section */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '30px',
          borderRadius: '12px 12px 0 0',
          color: 'white'
        }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size="large" align="center">
                <Avatar 
                  size={80} 
                  icon={<UserOutlined />}
                  src={user.avatar}
                  style={{ 
                    border: '3px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                />
                <div>
                  <Title level={2} style={{ color: 'white', margin: 0 }}>
                    {user.fullName || user.username}
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
                    @{user.username}
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color={getRoleColor(user.role)} style={{ fontSize: '12px' }}>
                      {getRoleText(user.role)}
                    </Tag>
                    <Tag color="green" style={{ fontSize: '12px' }}>
                      Đang hoạt động
                    </Tag>
                  </div>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button 
                  type="primary" 
                  ghost 
                  icon={<EditOutlined />}
                  style={{ borderColor: 'white', color: 'white' }}
                >
                  Chỉnh sửa
                </Button>
                <Button 
                  type="primary" 
                  ghost 
                  icon={<SettingOutlined />}
                  style={{ borderColor: 'white', color: 'white' }}
                >
                  Cài đặt
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Content Section */}
        <div style={{ padding: '30px' }}>
          <Title level={4} style={{ marginBottom: 20 }}>
            Thông tin chi tiết
          </Title>
          
          <Descriptions 
            column={1} 
            size="large"
            labelStyle={{ 
              fontWeight: 600, 
              color: '#1f2937',
              width: '150px'
            }}
            contentStyle={{ 
              color: '#374151'
            }}
          >
            <Descriptions.Item 
              label={
                <Space>
                  <UserOutlined style={{ color: '#667eea' }} />
                  Tài khoản
                </Space>
              }
            >
              <Text strong>{user.username}</Text>
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={
                <Space>
                  <MailOutlined style={{ color: '#667eea' }} />
                  Email
                </Space>
              }
            >
              <Text copyable>{user.email}</Text>
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={
                <Space>
                  <PhoneOutlined style={{ color: '#667eea' }} />
                  Số điện thoại
                </Space>
              }
            >
              <Text copyable>{user.phone}</Text>
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={
                <Space>
                  <HomeOutlined style={{ color: '#667eea' }} />
                  Địa chỉ
                </Space>
              }
            >
              {user.address}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card 
                size="small" 
                style={{ 
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary">Ngày tham gia</Text>
                  <div style={{ marginTop: 4 }}>
                    <Text strong style={{ fontSize: '16px' }}>
                      {new Date(user.joinDate).toLocaleDateString('vi-VN')}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12}>
              <Card 
                size="small" 
                style={{ 
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary">ID người dùng</Text>
                  <div style={{ marginTop: 4 }}>
                    <Text strong style={{ fontSize: '16px' }}>
                      #{user.id}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;