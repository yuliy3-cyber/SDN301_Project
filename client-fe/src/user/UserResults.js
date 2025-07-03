import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Table, 
  Card, 
  Statistic, 
  Row, 
  Col, 
  Tag, 
  Typography, 
  Spin, 
  Alert, 
  Empty,
  Space,
  Avatar
} from 'antd';
import { 
  TrophyOutlined, 
  CalendarOutlined, 
  FileTextOutlined, 
  StarOutlined,
  RiseOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const UserResults = () => {
  const userId = localStorage.getItem("userId");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:9999/results/${userId}`);
        setResults(res.data.results);
      } catch (err) {
        setError("Không thể tải kết quả. Vui lòng thử lại sau.");
        console.error("Lỗi khi tải kết quả:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [userId]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreTag = (score) => {
    if (score >= 9) return <Tag color="success" icon={<TrophyOutlined />}>{score}/10</Tag>;
    if (score >= 7) return <Tag color="processing" icon={<StarOutlined />}>{score}/10</Tag>;
    if (score >= 5) return <Tag color="warning">{score}/10</Tag>;
    return <Tag color="error">{score}/10</Tag>;
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => (
        <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
          {index + 1}
        </Avatar>
      ),
    },
    {
      title: (
        <Space>
          <FileTextOutlined />
          Mã đề thi
        </Space>
      ),
      dataIndex: ['examId', 'code'],
      key: 'examCode',
      render: (code, record) => (
        <Tag color="blue" style={{ fontFamily: 'monospace' }}>
          {code || record.examId}
        </Tag>
      ),
    },
    {
      title: (
        <Space>
          <TrophyOutlined />
          Điểm số
        </Space>
      ),
      dataIndex: 'score',
      key: 'score',
      align: 'center',
      render: (score) => getScoreTag(score),
      sorter: (a, b) => a.score - b.score,
    },
    {
      title: (
        <Space>
          <CalendarOutlined />
          Ngày làm bài
        </Space>
      ),
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date) => (
        <Text type="secondary">{formatDate(date)}</Text>
      ),
      sorter: (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt),
    },
  ];

  const calculateStats = () => {
    if (results.length === 0) return { avg: 0, max: 0, excellent: 0 };
    
    const avg = (results.reduce((sum, r) => sum + r.score, 0) / results.length);
    const max = Math.max(...results.map(r => r.score));
    const excellent = results.filter(r => r.score >= 8).length;
    
    return { avg: avg.toFixed(1), max: max.toFixed(1), excellent };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang tải kết quả...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Alert
          message="Có lỗi xảy ra"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ color: 'white' }}>
          <Space align="center" size="large">
            <TrophyOutlined style={{ fontSize: '32px' }} />
            <div>
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                Kết quả bài thi
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                Tổng hợp điểm số và thành tích của bạn
              </Text>
            </div>
          </Space>
        </div>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng bài thi"
              value={results.length}
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Điểm trung bình"
              value={stats.avg}
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
              suffix="/ 10"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Điểm cao nhất"
              value={stats.max}
              prefix={<StarOutlined style={{ color: '#faad14' }} />}
              suffix="/ 10"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Bài xuất sắc"
              value={stats.excellent}
              prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />}
              suffix="bài"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Results Table */}
      <Card 
        title={
          <Space>
            <FileTextOutlined />
            Chi tiết kết quả
          </Space>
        }
      >
        {results.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                Bạn chưa hoàn thành bài thi nào.<br />
                Hãy bắt đầu làm bài để xem kết quả!
              </span>
            }
          />
        ) : (
          <Table
            columns={columns}
            dataSource={results}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} kết quả`,
            }}
            scroll={{ x: 800 }}
            rowClassName={(record, index) => 
              index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
            }
          />
        )}
      </Card>

      <style jsx>{`
        .table-row-light {
          background-color: #fafafa;
        }
        .table-row-dark {
          background-color: #ffffff;
        }
      `}</style>
    </div>
  );
};

export default UserResults;