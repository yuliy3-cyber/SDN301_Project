import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Input,
  Select,
  Button,
  Tag,
  Avatar,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  message,
  Spin,
  Empty,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  LockOutlined,
  UnlockOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CrownOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:9999/admin/user", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách người dùng:", err);
      message.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      const matchesStatus = filterStatus === "all" || user.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole, filterStatus]);

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    setUpdating(prev => ({ ...prev, [id]: true }));
    
    try {
      await fetch(`http://localhost:9999/admin/user/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, status: nextStatus } : u
        )
      );
      
      message.success(
        nextStatus === "active" 
          ? "Đã kích hoạt tài khoản thành công" 
          : "Đã khóa tài khoản thành công"
      );
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      message.error("Không thể cập nhật trạng thái");
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'username',
      key: 'username',
      width: 250,
      render: (text, record) => (
        <Space>
          <Avatar 
            size={40} 
            style={{ 
              backgroundColor: record.role === 'admin' ? '#faad14' : '#1890ff',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {getInitials(text)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{text}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div>
          {record.phone && (
            <div style={{ marginBottom: 4 }}>
              <PhoneOutlined style={{ marginRight: 6, color: '#52c41a' }} />
              <Text style={{ fontSize: '12px' }}>{record.phone}</Text>
            </div>
          )}
          {record.address && (
            <div>
              <EnvironmentOutlined style={{ marginRight: 6, color: '#fa8c16' }} />
              <Tooltip title={record.address}>
                <Text style={{ fontSize: '12px' }} ellipsis>
                  {record.address.length > 30 ? record.address.substring(0, 30) + '...' : record.address}
                </Text>
              </Tooltip>
            </div>
          )}
          {!record.phone && !record.address && (
            <Text type="secondary" style={{ fontSize: '12px' }}>Chưa có thông tin</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => (
        <Tag 
          icon={role === 'admin' ? <CrownOutlined /> : <UserOutlined />}
          color={role === 'admin' ? 'gold' : 'blue'}
          style={{ fontSize: '11px', padding: '4px 8px' }}
        >
          {role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag 
          color={status === 'active' ? 'success' : 'error'}
          style={{ fontSize: '11px', padding: '4px 8px' }}
        >
          {status === 'active' ? 'Đang hoạt động' : 'Bị khóa'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          {record.role !== 'admin' && (
            <Button
              type={record.status === 'active' ? 'primary' : 'default'}
              danger={record.status === 'active'}
              size="small"
              icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
              loading={updating[record._id]}
              onClick={() => toggleStatus(record._id, record.status)}
              style={{ fontSize: '11px' }}
            >
              {record.status === 'active' ? 'Khóa' : 'Mở khóa'}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const activeUsers = users.filter(u => u.status === 'active').length;
  const inactiveUsers = users.filter(u => u.status === 'inactive').length;

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
            <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Quản lý người dùng
          </Title>
          <Text type="secondary">Quản lý và theo dõi tất cả người dùng trong hệ thống</Text>
        </div>

        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng người dùng"
                value={users.length}
                valueStyle={{ color: '#1890ff' }}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Đang hoạt động"
                value={activeUsers}
                valueStyle={{ color: '#52c41a' }}
                prefix={<EyeOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Bị khóa"
                value={inactiveUsers}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<LockOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm kiếm theo tên hoặc email..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="Vai trò"
                value={filterRole}
                onChange={setFilterRole}
                style={{ width: '100%' }}
              >
                <Option value="all">Tất cả vai trò</Option>
                <Option value="admin">Admin</Option>
                <Option value="user">User</Option>
              </Select>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="Trạng thái"
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: '100%' }}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="active">Hoạt động</Option>
                <Option value="inactive">Bị khóa</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} người dùng`,
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không tìm thấy người dùng nào"
                />
              ),
            }}
            scroll={{ x: 800 }}
            size="middle"
          />
        </Card>
      </div>
    </div>
  );
};

export default AdminUsers;