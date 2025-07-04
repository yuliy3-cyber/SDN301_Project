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
  Alert,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Tabs
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  EditOutlined,
  SettingOutlined,
  CameraOutlined,
  LockOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

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

  const handleEditClick = () => {
    form.setFieldsValue({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || ''
    });
    setEditModalVisible(true);
  };

  const handleUpdateProfile = async (values) => {
    try {
      setUpdateLoading(true);
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:9999/user/${userId}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.user) {
        setUser(response.data.user);
        message.success('Cập nhật thông tin thành công!');
        setEditModalVisible(false);
        form.resetFields();
      }
    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err);
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdatePassword = async (values) => {
    try {
      setUpdateLoading(true);
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://localhost:9999/user/${userId}/password`,
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      message.success('Đổi mật khẩu thành công!');
      passwordForm.resetFields();
    } catch (err) {
      console.error("❌ Lỗi đổi mật khẩu:", err);
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    setEditModalVisible(false);
    form.resetFields();
    passwordForm.resetFields();
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Bạn chỉ có thể tải lên file JPG/PNG!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Hình ảnh phải nhỏ hơn 2MB!');
      return false;
    }
    return true;
  };

  const handleUpload = async (info) => {
    if (info.file.status === 'uploading') {
      message.loading('Đang tải lên avatar...', 0);
      return;
    }
    if (info.file.status === 'done') {
      message.destroy();
      // Xử lý upload avatar ở đây
      const avatarUrl = info.file.response?.url;
      if (avatarUrl) {
        try {
          const userId = localStorage.getItem("userId");
          const token = localStorage.getItem("token");

          const response = await axios.put(
            `http://localhost:9999/user/${userId}/avatar`,
            { avatar: avatarUrl },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.data.user) {
            setUser(response.data.user);
            message.success('Cập nhật avatar thành công!');
          }
        } catch (err) {
          console.error("❌ Lỗi cập nhật avatar:", err);
          message.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật avatar');
        }
      }
    }
    if (info.file.status === 'error') {
      message.destroy();
      message.error('Tải lên avatar thất bại!');
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

  if (error) {
    return (
      <Card style={{ maxWidth: 600, margin: '0 auto' }}>
        <Alert message="Lỗi" description={error} type="error" showIcon />
      </Card>
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
                <div style={{ position: 'relative' }}>
                  <Avatar
                    size={80}
                    icon={<UserOutlined />}
                    src={user.avatar}
                    style={{
                      border: '3px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                  />
                  <Upload
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    onChange={handleUpload}
                    accept="image/*"
                    action="http://localhost:9999/upload" // ✅ chỉ rõ nơi upload ảnh
                    headers={{
                      Authorization: `Bearer ${localStorage.getItem("token")}`
                    }}
                  >
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<CameraOutlined />}
                      size="small"
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        borderColor: 'rgba(255,255,255,0.3)'
                      }}
                    />
                  </Upload>
                </div>
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
                    <Tag
                      color={user.status === 'active' ? 'green' : 'default'}
                      style={{ fontSize: '12px' }}
                    >
                      {user.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
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
                  onClick={handleEditClick}
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
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
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
                      #{user._id}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa thông tin"
        visible={editModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Thông tin cá nhân" key="1">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
              style={{ marginTop: 16 }}
            >
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[
                  { required: true, message: 'Vui lòng nhập họ và tên!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nhập họ và tên"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Nhập email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Nhập số điện thoại"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="address"
                label="Địa chỉ"
              >
                <Input
                  prefix={<HomeOutlined />}
                  placeholder="Nhập địa chỉ"
                  size="large"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button
                    onClick={handleCancel}
                    icon={<CloseOutlined />}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updateLoading}
                    icon={<SaveOutlined />}
                  >
                    Lưu thay đổi
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Đổi mật khẩu" key="2">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleUpdatePassword}
              style={{ marginTop: 16 }}
            >
              <Form.Item
                name="currentPassword"
                label="Mật khẩu hiện tại"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu hiện tại"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu mới"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Xác nhận mật khẩu mới"
                  size="large"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button
                    onClick={handleCancel}
                    icon={<CloseOutlined />}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updateLoading}
                    icon={<SaveOutlined />}
                  >
                    Cập nhật mật khẩu
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};

export default UserProfile;