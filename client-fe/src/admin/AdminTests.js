import React, { useState, useEffect } from "react";
import {
  Card, Input, Button, InputNumber, Space, Typography, Divider,
  Tag, Row, Col, notification, Tabs, Modal, Table, Checkbox,
  Select, Popconfirm, Form, Pagination
} from 'antd';
import {
  PlusOutlined, ReloadOutlined, BulbOutlined, FileTextOutlined,
  CheckCircleOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

const AdminTests = () => {
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [duration, setDuration] = useState(30);
  const [questionIds, setQuestionIds] = useState([]);
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [randomLoading, setRandomLoading] = useState(false);
  
  // Data states
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  
  // Modal states
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  
  // Search states
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const API_BASE = "http://localhost:9999/admin";
  const getAuthHeaders = () => ({
    headers: { Authorization: "Bearer " + localStorage.getItem("token") }
  });

  // Tạo mã đề thi
  const generateExamCode = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const generatedCode = `EXAM-${random}`;
    setCode(generatedCode);
    notification.success({
      message: "🎯 Mã đề thi đã được tạo",
      description: generatedCode,
      placement: "topRight"
    });
  };

  // Chọn câu hỏi ngẫu nhiên
  const handleRandomQuestions = async () => {
    setRandomLoading(true);
    try {
      const response = await fetch(`${API_BASE}/questions/random?count=${count}`, getAuthHeaders());
      const data = await response.json();
      
      if (response.ok) {
        const ids = data.map(q => q._id);
        setQuestionIds(ids);
        notification.success({
          message: '🎲 Câu hỏi ngẫu nhiên',
          description: `Đã chọn ${ids.length} câu hỏi`,
          placement: 'topRight'
        });
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      notification.error({
        message: '❌ Lỗi khi chọn câu hỏi',
        description: err.message || 'Không thể lấy dữ liệu từ server',
        placement: 'topRight'
      });
    } finally {
      setRandomLoading(false);
    }
  };

  // Load danh sách môn học và độ khó
  const loadSubjectsAndLevels = async () => {
    try {
      const response = await fetch(`${API_BASE}/questions/subjects`, getAuthHeaders());
      const data = await response.json();
      
      if (response.ok) {
        setSubjects(data.subjects || []);
        setLevels(data.levels || []);
      }
    } catch (err) {
      console.error("Lỗi load subjects/levels:", err);
    }
  };

  // Tìm kiếm câu hỏi
  const searchQuestions = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (searchKeyword) params.append('keyword', searchKeyword);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (selectedLevel) params.append('level', selectedLevel);

      const response = await fetch(`${API_BASE}/questions/search?${params}`, getAuthHeaders());
      const data = await response.json();
      
      if (response.ok) {
        setAllQuestions(data.questions || []);
        setTotalQuestions(data.total || 0);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error("Lỗi tìm kiếm câu hỏi:", err);
    }
  };

  // Mở modal chọn câu hỏi
  const openQuestionModal = () => {
    setIsQuestionModalVisible(true);
    setSelectedQuestions([...questionIds]);
    searchQuestions(1);
  };

  // Xác nhận chọn câu hỏi
  const handleSelectQuestions = () => {
    setQuestionIds([...selectedQuestions]);
    setIsQuestionModalVisible(false);
    notification.success({
      message: '✅ Đã chọn câu hỏi',
      description: `Đã chọn ${selectedQuestions.length} câu hỏi`,
      placement: 'topRight'
    });
  };

  // Tạo đề thi
  const handleCreateTest = async () => {
    if (!title || !description || !code || questionIds.length === 0) {
      notification.warning({
        message: "⚠️ Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin và chọn câu hỏi.",
        placement: "topRight"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders().headers
        },
        body: JSON.stringify({ title, description, code, duration, questionIds })
      });

      const data = await response.json();

      if (response.ok) {
        notification.success({
          message: "✅ Tạo đề thi thành công",
          description: `Đề "${title}" đã được lưu.`,
          placement: "topRight"
        });

        // Reset form
        resetForm();
        fetchExams();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      notification.error({
        message: "❌ Lỗi khi tạo đề thi",
        description: err.message || "Không thể lưu vào hệ thống.",
        placement: "topRight"
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCode("");
    setDuration(30);
    setQuestionIds([]);
    setCount(5);
  };

  // Load danh sách đề thi
  const fetchExams = async () => {
    try {
      const response = await fetch(`${API_BASE}/tests`, getAuthHeaders());
      const data = await response.json();
      
      if (response.ok) {
        setExams(data);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách đề:", err);
    }
  };

  // Mở modal chỉnh sửa
  const openEditModal = async (exam) => {
    setEditingExam(exam);
    setTitle(exam.title);
    setDescription(exam.description);
    setCode(exam.code);
    setDuration(exam.duration);
    setQuestionIds(exam.questionIds || []);
    setIsEditModalVisible(true);
  };

  // Cập nhật đề thi
  const handleUpdateTest = async () => {
    if (!title || !description || !code || questionIds.length === 0) {
      notification.warning({
        message: "⚠️ Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin và chọn câu hỏi.",
        placement: "topRight"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/tests/${editingExam._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders().headers
        },
        body: JSON.stringify({ title, description, code, duration, questionIds })
      });

      const data = await response.json();

      if (response.ok) {
        notification.success({
          message: "✅ Cập nhật đề thi thành công",
          description: `Đề "${title}" đã được cập nhật.`,
          placement: "topRight"
        });

        setIsEditModalVisible(false);
        resetForm();
        fetchExams();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      notification.error({
        message: "❌ Lỗi khi cập nhật đề thi",
        description: err.message || "Không thể cập nhật.",
        placement: "topRight"
      });
    } finally {
      setLoading(false);
    }
  };

  // Xóa đề thi
  const handleDeleteTest = async (examId, examTitle) => {
    try {
      const response = await fetch(`${API_BASE}/tests/${examId}`, {
        method: 'DELETE',
        ...getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        notification.success({
          message: "✅ Xóa đề thi thành công",
          description: `Đã xóa đề "${examTitle}"`,
          placement: "topRight"
        });
        fetchExams();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      notification.error({
        message: "❌ Lỗi khi xóa đề thi",
        description: err.message || "Không thể xóa đề thi.",
        placement: "topRight"
      });
    }
  };

  useEffect(() => {
    loadSubjectsAndLevels();
    fetchExams();
  }, []);

  // Columns cho bảng câu hỏi
  const questionColumns = [
    {
      title: 'Chọn',
      dataIndex: '_id',
      width: 60,
      render: (id) => (
        <Checkbox
          checked={selectedQuestions.includes(id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedQuestions([...selectedQuestions, id]);
            } else {
              setSelectedQuestions(selectedQuestions.filter(qId => qId !== id));
            }
          }}
        />
      )
    },
    {
      title: 'Câu hỏi',
      dataIndex: 'content',
      render: (content) => (
        <Text ellipsis={{ tooltip: content }} style={{ maxWidth: 300 }}>
          {content}
        </Text>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Title level={2} style={{ marginBottom: '24px', color: '#1890ff' }}>
        <FileTextOutlined /> Quản lý đề thi
      </Title>

      <Tabs defaultActiveKey="1" size="large">
        <TabPane tab="Tạo đề thi mới" key="1" icon={<PlusOutlined />}>
          <Card 
            title="📝 Tạo đề thi mới" 
            style={{ 
              marginBottom: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <Form layout="vertical">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item label="Tiêu đề đề thi">
                    <Input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Nhập tiêu đề đề thi"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Thời gian làm bài">
                    <InputNumber
                      value={duration}
                      onChange={value => setDuration(value)}
                      placeholder="Phút"
                      size="large"
                      min={1}
                      max={300}
                      style={{ width: '100%' }}
                      addonAfter="phút"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Mô tả đề thi">
                <TextArea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Mô tả nội dung đề thi"
                  rows={4}
                  size="large"
                />
              </Form.Item>

              <Form.Item label="Mã đề thi">
                <Input.Group compact>
                  <Input
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="Mã đề"
                    size="large"
                    style={{ width: 'calc(100% - 150px)' }}
                  />
                  <Button
                    type="primary"
                    icon={<BulbOutlined />}
                    onClick={generateExamCode}
                    size="large"
                    style={{
                      width: '150px',
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      border: 'none'
                    }}
                  >
                    Tạo mã đề
                  </Button>
                </Input.Group>
              </Form.Item>

              <Divider orientation="left">
                <Text strong style={{ color: '#667eea' }}>Chọn câu hỏi</Text>
              </Divider>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Form.Item label="Số lượng câu hỏi ngẫu nhiên">
                    <InputNumber
                      value={count}
                      onChange={value => setCount(value)}
                      min={1}
                      max={100}
                      size="large"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Button
                    type="primary"
                    onClick={handleRandomQuestions}
                    loading={randomLoading}
                    size="large"
                    icon={<ReloadOutlined />}
                    style={{
                      width: '100%',
                      marginTop: '32px',
                      background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
                      border: 'none'
                    }}
                  >
                    Chọn ngẫu nhiên
                  </Button>
                </Col>
                <Col xs={24} sm={8}>
                  <Button
                    type="default"
                    onClick={openQuestionModal}
                    size="large"
                    icon={<SearchOutlined />}
                    style={{
                      width: '100%',
                      marginTop: '32px',
                      background: 'linear-gradient(45deg, #43e97b, #38f9d7)',
                      border: 'none',
                      color: 'white'
                    }}
                  >
                    Chọn thủ công
                  </Button>
                </Col>
              </Row>

              {questionIds.length > 0 && (
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  background: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  borderRadius: '8px'
                }}>
                  <Space align="center">
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                    <Text strong style={{ color: '#389e0d' }}>
                      Đã chọn {questionIds.length} câu hỏi
                    </Text>
                    <Tag color="success">{questionIds.length} câu hỏi</Tag>
                  </Space>
                </div>
              )}

              <div style={{ marginTop: '32px', textAlign: 'center' }}>
                <Space size="middle">
                  <Button
                    size="large"
                    onClick={resetForm}
                  >
                    Làm mới
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleCreateTest}
                    loading={loading}
                    size="large"
                    icon={<CheckCircleOutlined />}
                    style={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      border: 'none'
                    }}
                  >
                    {loading ? 'Đang tạo...' : 'Tạo đề thi'}
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="Danh sách đề thi" key="2" icon={<FileTextOutlined />}>
          <Card 
            title="📋 Danh sách đề thi" 
            extra={
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchExams}
                type="primary"
              >
                Làm mới
              </Button>
            }
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <Row gutter={[16, 16]}>
              {exams.map(exam => (
                <Col xs={24} sm={12} lg={8} key={exam._id}>
                  <Card
                    size="small"
                    title={exam.title}
                    extra={
                      <Space>
                        <Button
                          type="primary"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => openEditModal(exam)}
                        >
                          Sửa
                        </Button>
                        <Popconfirm
                          title="Xóa đề thi?"
                          description="Bạn có chắc chắn muốn xóa đề thi này?"
                          onConfirm={() => handleDeleteTest(exam._id, exam.title)}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                          >
                            Xóa
                          </Button>
                        </Popconfirm>
                      </Space>
                    }
                    style={{ marginBottom: '16px' }}
                  >
                    <p><strong>Mã:</strong> {exam.code}</p>
                    <p><strong>Mô tả:</strong> {exam.description}</p>
                    <p><strong>Thời gian:</strong> {exam.duration} phút</p>
                    <p><strong>Số câu hỏi:</strong> {exam.questionIds?.length || 0}</p>
                    <Tag color="blue">
                      {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                    </Tag>
                  </Card>
                </Col>
              ))}
            </Row>
            
            {exams.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <FileTextOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                <p style={{ marginTop: '16px', color: '#999' }}>
                  Chưa có đề thi nào. Hãy tạo đề thi đầu tiên!
                </p>
              </div>
            )}
          </Card>
        </TabPane>
      </Tabs>

      {/* Modal chọn câu hỏi */}
      <Modal
        title="🔍 Chọn câu hỏi thủ công"
        open={isQuestionModalVisible}
        onCancel={() => setIsQuestionModalVisible(false)}
        onOk={handleSelectQuestions}
        width={1000}
        okText={`Chọn ${selectedQuestions.length} câu hỏi`}
        cancelText="Hủy"
      >
        {/* Bộ lọc tìm kiếm */}
        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={8}>
            <Input
              placeholder="Tìm kiếm câu hỏi..."
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Môn học"
              value={selectedSubject}
              onChange={setSelectedSubject}
              allowClear
              style={{ width: '100%' }}
            >
              {subjects.map(subject => (
                <Option key={subject} value={subject}>{subject}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Độ khó"
              value={selectedLevel}
              onChange={setSelectedLevel}
              allowClear
              style={{ width: '100%' }}
            >
              {levels.map(level => (
                <Option key={level} value={level}>{level}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Button 
              type="primary" 
              onClick={() => searchQuestions(1)}
              style={{ width: '100%' }}
            >
              Tìm kiếm
            </Button>
          </Col>
        </Row>

        {/* Nút chọn tất cả */}
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button
              onClick={() => {
                const allIds = allQuestions.map(q => q._id);
                const newSelected = [...selectedQuestions];
                allIds.forEach(id => {
                  if (!newSelected.includes(id)) {
                    newSelected.push(id);
                  }
                });
                setSelectedQuestions(newSelected);
              }}
            >
              Chọn tất cả trang này
            </Button>
            <Button
              onClick={() => setSelectedQuestions([])}
            >
              Bỏ chọn tất cả
            </Button>
            <Text type="secondary">
              Đã chọn: {selectedQuestions.length} câu hỏi
            </Text>
          </Space>
        </div>

        {/* Bảng câu hỏi */}
        <Table
          columns={questionColumns}
          dataSource={allQuestions}
          rowKey="_id"
          pagination={false}
          size="small"
          scroll={{ y: 400 }}
        />

        {/* Phân trang */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Pagination
            current={currentPage}
            total={totalQuestions}
            pageSize={10}
            onChange={searchQuestions}
            showSizeChanger={false}
            showTotal={(total, range) => 
              `${range[0]}-${range[1]} của ${total} câu hỏi`
            }
          />
        </div>
      </Modal>

      {/* Modal chỉnh sửa đề thi */}
      <Modal
        title="✏️ Chỉnh sửa đề thi"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          resetForm();
        }}
        footer={null}
        width={800}
      >
        <Form layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item label="Tiêu đề đề thi">
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề đề thi"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Thời gian làm bài">
                <InputNumber
                  value={duration}
                  onChange={value => setDuration(value)}
                  placeholder="Phút"
                  size="large"
                  min={1}
                  max={300}
                  style={{ width: '100%' }}
                  addonAfter="phút"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả đề thi">
            <TextArea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mô tả nội dung đề thi"
              rows={4}
              size="large"
            />
          </Form.Item>

          <Form.Item label="Mã đề thi">
            <Input.Group compact>
              <Input
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Mã đề"
                size="large"
                style={{ width: 'calc(100% - 150px)' }}
              />
              <Button
                type="primary"
                icon={<BulbOutlined />}
                onClick={generateExamCode}
                size="large"
                style={{
                  width: '150px',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  border: 'none'
                }}
              >
                Tạo mã đề
              </Button>
            </Input.Group>
          </Form.Item>

          <Divider orientation="left">
            <Text strong style={{ color: '#667eea' }}>Chọn câu hỏi</Text>
          </Divider>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Form.Item label="Số lượng câu hỏi ngẫu nhiên">
                <InputNumber
                  value={count}
                  onChange={value => setCount(value)}
                  min={1}
                  max={100}
                  size="large"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Button
                type="primary"
                onClick={handleRandomQuestions}
                loading={randomLoading}
                size="large"
                icon={<ReloadOutlined />}
                style={{
                  width: '100%',
                  marginTop: '32px',
                  background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
                  border: 'none'
                }}
              >
                Chọn ngẫu nhiên
              </Button>
            </Col>
            <Col xs={24} sm={8}>
              <Button
                type="default"
                onClick={openQuestionModal}
                size="large"
                icon={<SearchOutlined />}
                style={{
                  width: '100%',
                  marginTop: '32px',
                  background: 'linear-gradient(45deg, #43e97b, #38f9d7)',
                  border: 'none',
                  color: 'white'
                }}
              >
                Chọn thủ công
              </Button>
            </Col>
          </Row>

          {questionIds.length > 0 && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '8px'
            }}>
              <Space align="center">
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                <Text strong style={{ color: '#389e0d' }}>
                  Đã chọn {questionIds.length} câu hỏi
                </Text>
                <Tag color="success">{questionIds.length} câu hỏi</Tag>
              </Space>
            </div>
          )}

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <Space size="middle">
              <Button
                size="large"
                onClick={() => {
                  setIsEditModalVisible(false);
                  resetForm();
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                onClick={handleUpdateTest}
                loading={loading}
                size="large"
                icon={<CheckCircleOutlined />}
                style={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  border: 'none'
                }}
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật đề thi'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminTests;