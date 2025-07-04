import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Button,
  Typography,
  Row,
  Col,
  Radio,
  Progress,
  Result,
  Tag,
  Space,
  Spin,
  Alert,
  Breadcrumb,
  Statistic,
  Divider,
  message,
  Modal,
  Avatar,
  Badge
} from 'antd';
import {
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
  FireOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  PlayCircleOutlined,
  EditOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const PracticeQuizApp = () => {
  // States
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  // Fetch questions on component mount
  useEffect(() => {
    loadQuestions();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && timerActive) {
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  // Prevent page refresh/close during quiz
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (quizStarted && !isSubmitted) {
        e.preventDefault();
        e.returnValue = 'Bạn có chắc muốn thoát? Bài thi sẽ bị hủy.';
        return 'Bạn có chắc muốn thoát? Bài thi sẽ bị hủy.';
      }
    };

    const handlePopState = (e) => {
      if (quizStarted && !isSubmitted) {
        e.preventDefault();
        confirm({
          title: 'Cảnh báo!',
          icon: <ExclamationCircleOutlined />,
          content: 'Bạn có chắc muốn thoát khỏi bài thi? Tiến trình sẽ bị mất.',
          onOk() {
            forceExit();
          },
          onCancel() {
            // Push state back to prevent navigation
            window.history.pushState(null, null, window.location.pathname);
          }
        });
        // Push state back to prevent navigation
        window.history.pushState(null, null, window.location.pathname);
      }
    };

    if (quizStarted && !isSubmitted) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
      // Add state to history to catch back button
      window.history.pushState(null, null, window.location.pathname);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [quizStarted, isSubmitted]);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:9999/admin/questions');
      const data = await response.json();
      setAllQuestions(data);
    } catch (err) {
      setError('Không thể tải câu hỏi. Vui lòng thử lại!');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectGroups = () => {
    return allQuestions.reduce((acc, question) => {
      const subject = question.subject || 'Khác';
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push(question);
      return acc;
    }, {});
  };

  const getSubjectIcon = (subject) => {
    const icons = {
      'react': '⚛️',
      'javascript': '🟨',
      'html': '📄',
      'css': '🎨',
      'web': '🌐',
      'wwb': '🌐',
      'node.js': '🟢',
      'nodejs': '🟢'
    };
    return icons[subject.toLowerCase()] || '📖';
  };

  const selectSubject = (subject) => {
    const subjectQuestions = allQuestions.filter(q => q.subject === subject);
    setSelectedSubject(subject);
    setCurrentQuestions(subjectQuestions);
    setUserAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setQuizStarted(false); // Chưa bắt đầu thi

    // Calculate total time
    const totalTime = subjectQuestions.reduce((sum, q) => {
      return sum + (q.duration || 1) * 60;
    }, 0);

    setTimeRemaining(totalTime);
    setTimerActive(false); // Chưa bắt đầu đếm ngược
    message.success(`Đã chọn chủ đề "${subject}"`);
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimerActive(true);
    message.info('Bài thi đã bắt đầu! Chúc bạn may mắn!');
  };

  const goBackToSubjects = () => {
    if (quizStarted && !isSubmitted) {
      confirm({
        title: 'Cảnh báo!',
        icon: <ExclamationCircleOutlined />,
        content: 'Bạn có chắc muốn thoát khỏi bài thi? Tiến trình sẽ bị mất.',
        onOk() {
          forceExit();
        }
      });
      return;
    }

    // Nếu đã hoàn thành bài thi, quay về trang chủ
    resetToHome();
  };

  const forceExit = () => {
    setSelectedSubject(null);
    setCurrentQuestions([]);
    setUserAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setTimerActive(false);
    setTimeRemaining(0);
    setQuizStarted(false);
    message.warning('Đã thoát khỏi bài thi');
  };

  const resetToHome = () => {
    setSelectedSubject(null);
    setCurrentQuestions([]);
    setUserAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setTimerActive(false);
    setTimeRemaining(0);
    setQuizStarted(false);
  };

  const handleAnswerChange = (questionId, answerIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    currentQuestions.forEach(question => {
      if (userAnswers[question._id] === question.correctAnswer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setIsSubmitted(true);
    setTimerActive(false);
    setQuizStarted(false); // Đã hoàn thành

    const percentage = (correctCount / currentQuestions.length) * 100;
    if (percentage >= 80) {
      message.success('Xuất sắc! Bạn đã làm rất tốt!');
    } else if (percentage >= 60) {
      message.warning('Khá tốt! Hãy cố gắng hơn nữa!');
    } else {
      message.error('Cần cải thiện! Hãy ôn tập thêm!');
    }
  };

  const handleTimeUp = () => {
    setTimerActive(false);
    setQuizStarted(false);
    handleSubmit();
    message.warning('Hết giờ! Bài thi được tự động nộp.');
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setQuizStarted(false);

    // Reset timer
    const totalTime = currentQuestions.reduce((sum, q) => {
      return sum + (q.duration || 1) * 60;
    }, 0);
    setTimeRemaining(totalTime);
    setTimerActive(false);

    message.info('Đã reset bài thi');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = () => {
    const percentage = (score / currentQuestions.length) * 100;
    if (percentage >= 80) return '#52c41a';
    if (percentage >= 60) return '#faad14';
    return '#f5222d';
  };

  const answeredCount = Object.keys(userAnswers).length;
  const progressPercentage = currentQuestions.length > 0 ? (answeredCount / currentQuestions.length) * 100 : 0;

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <Spin size="large" tip="Đang tải câu hỏi...">
          <div style={{ padding: '50px' }} />
        </Spin>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={loadQuestions}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Content style={{ padding: '24px' }}>
        {!selectedSubject ? (
          // Subject Selection Screen
          <div>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Title level={1} style={{ color: '#1890ff', marginBottom: '8px' }}>
                🎯 Chọn chủ đề ôn tập
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Hệ thống có <strong>{allQuestions.length}</strong> câu hỏi được phân loại theo chủ đề
              </Text>
            </div>

            <Row gutter={[32, 32]} justify="center">
              {Object.entries(getSubjectGroups()).map(([subject, questions]) => (
                <Col xs={24} sm={12} md={8} lg={6} key={subject}>
                  <Badge.Ribbon text={`${questions.length} câu`} color="blue">
                    <Card
                      hoverable
                      style={{
                        textAlign: 'center',
                        borderRadius: '16px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        transition: 'all 0.3s ease',
                        border: '2px solid transparent',
                        height: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}
                      bodyStyle={{ padding: '32px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                      onClick={() => selectSubject(subject)}
                      className="subject-card"
                    >
                      <div style={{ fontSize: '56px', marginBottom: '16px', lineHeight: 1 }}>
                        {getSubjectIcon(subject)}
                      </div>
                      <Title level={4} style={{ marginBottom: '8px', color: '#1890ff' }}>
                        {subject}
                      </Title>
                      <Text type="secondary">
                        Nhấn để bắt đầu
                      </Text>
                    </Card>
                  </Badge.Ribbon>
                </Col>
              ))}
            </Row>

            <style jsx>{`
              .subject-card:hover {
                transform: translateY(-8px) !important;
                box-shadow: 0 16px 32px rgba(0,0,0,0.16) !important;
                border-color: #1890ff !important;
              }
            `}</style>
          </div>
        ) : (
          // Quiz Screen
          <div>
            {/* Subject Overview - Before Quiz Starts */}
            {!quizStarted && !isSubmitted && (
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <Card
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '16px',
                    border: 'none',
                    color: 'white'
                  }}
                  bodyStyle={{ padding: '48px' }}
                >
                  <div style={{ fontSize: '72px', marginBottom: '24px' }}>
                    {getSubjectIcon(selectedSubject)}
                  </div>
                  <Title level={1} style={{ color: 'white', marginBottom: '16px' }}>
                    {selectedSubject}
                  </Title>
                  <Row gutter={[48, 24]} justify="center" style={{ marginBottom: '32px' }}>
                    <Col>
                      <Statistic
                        title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Số câu hỏi</span>}
                        value={currentQuestions.length}
                        prefix={<EditOutlined />}
                        valueStyle={{ color: 'white', fontSize: '28px' }}
                      />
                    </Col>
                    <Col>
                      <Statistic
                        title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Thời gian</span>}
                        value={formatTime(timeRemaining)}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: 'white', fontSize: '28px' }}
                      />
                    </Col>
                  </Row>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlayCircleOutlined />}
                    onClick={startQuiz}
                    style={{
                      height: '56px',
                      paddingLeft: '32px',
                      paddingRight: '32px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      backgroundColor: '#fff',
                      borderColor: '#fff',
                      color: '#1890ff',
                      borderRadius: '28px'
                    }}
                  >
                    Bắt đầu làm bài
                  </Button>
                </Card>
              </div>
            )}

            {/* Quiz Header - During Quiz */}
            {quizStarted && !isSubmitted && (
              <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space>
                      <Badge status="processing" />
                      <Title level={3} style={{ margin: 0 }}>
                        <FireOutlined style={{ color: '#f5222d' }} /> {selectedSubject}
                      </Title>
                    </Space>
                    <Text type="secondary">
                      {currentQuestions.length} câu hỏi • Đã trả lời: {answeredCount}
                    </Text>
                  </Col>
                  <Col>
                    <Statistic
                      title="Thời gian còn lại"
                      value={formatTime(timeRemaining)}
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{
                        color: timeRemaining < 300 ? '#f5222d' : '#1890ff',
                        fontSize: '24px',
                        fontWeight: 'bold'
                      }}
                    />
                  </Col>
                </Row>

                <Divider />

                <Progress
                  percent={Math.round(progressPercentage)}
                  status="active"
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  strokeWidth={8}
                  style={{ marginBottom: '8px' }}
                />
                <Text type="secondary">
                  Tiến trình: {answeredCount}/{currentQuestions.length} câu
                </Text>
              </Card>
            )}

            {/* Results */}
            {isSubmitted && (
              <Card style={{ marginBottom: '24px', borderRadius: '16px' }}>
                <Result
                  icon={<TrophyOutlined style={{ color: getScoreColor(), fontSize: '72px' }} />}
                  title={
                    <Title level={2} style={{ color: getScoreColor() }}>
                      Kết quả: {score}/{currentQuestions.length} câu đúng
                    </Title>
                  }
                  subTitle={
                    <Text style={{ fontSize: '18px' }}>
                      Điểm số: <strong>{Math.round((score / currentQuestions.length) * 100)}%</strong>
                    </Text>
                  }
                  extra={[
                    <Button
                      key="retry"
                      type="primary"
                      icon={<ReloadOutlined />}
                      onClick={resetQuiz}
                      size="large"
                      style={{ marginRight: '12px' }}
                    >
                      Làm lại
                    </Button>,
                    <Button
                      key="home"
                      icon={<HomeOutlined />}
                      onClick={resetToHome}
                      size="large"
                    >
                      Về trang chủ
                    </Button>
                  ]}
                />
              </Card>
            )}

            {/* Questions - Only show when quiz started */}
            {quizStarted && (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {currentQuestions.map((question, index) => (
                  <Card
                    key={question._id}
                    style={{
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      ...(isSubmitted && {
                        borderColor: userAnswers[question._id] === question.correctAnswer ? '#52c41a' : '#f5222d',
                        borderWidth: '2px',
                        backgroundColor: userAnswers[question._id] === question.correctAnswer ? '#f6ffed' : '#fff2f0'
                      })
                    }}
                    title={
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Space>
                            <Tag color="blue" style={{ fontSize: '14px' }}>
                              Câu {index + 1}
                            </Tag>
                            <Tag color="orange">{question.subject}</Tag>
                            {isSubmitted && (
                              userAnswers[question._id] === question.correctAnswer ? (
                                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                              ) : (
                                <CloseCircleOutlined style={{ color: '#f5222d', fontSize: '18px' }} />
                              )
                            )}
                          </Space>
                        </Col>
                        <Col>
                          {userAnswers[question._id] !== undefined && (
                            <Badge status="success" text="Đã trả lời" />
                          )}
                        </Col>
                      </Row>
                    }
                  >
                    <Paragraph style={{ fontSize: '16px', fontWeight: 500, marginBottom: '24px', lineHeight: '1.6' }}>
                      {question.content}
                    </Paragraph>

                    <Radio.Group
                      value={userAnswers[question._id]}
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                      disabled={isSubmitted}
                      style={{ width: '100%' }}
                    >
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        {question.options.map((option, optionIndex) => (
                          <Radio
                            key={optionIndex}
                            value={optionIndex}
                            style={{
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '2px solid #f0f0f0',
                              width: '100%',
                              fontSize: '15px',
                              transition: 'all 0.2s ease',
                              ...(isSubmitted && optionIndex === question.correctAnswer && {
                                backgroundColor: '#f6ffed',
                                borderColor: '#52c41a',
                                color: '#52c41a',
                                fontWeight: 'bold'
                              }),
                              ...(isSubmitted && userAnswers[question._id] === optionIndex && optionIndex !== question.correctAnswer && {
                                backgroundColor: '#fff2f0',
                                borderColor: '#f5222d',
                                color: '#f5222d'
                              })
                            }}
                          >
                            {option}
                            {isSubmitted && optionIndex === question.correctAnswer && (
                              <Tag color="success" size="small" style={{ marginLeft: '8px' }}>
                                Đáp án đúng
                              </Tag>
                            )}
                          </Radio>
                        ))}
                      </Space>
                    </Radio.Group>

                    {isSubmitted && question.explanation && (
                      <Alert
                        message={userAnswers[question._id] === question.correctAnswer ? "Chính xác!" : "Sai rồi!"}
                        description={
                          <div style={{ fontSize: '14px' }}>
                            <strong>Giải thích:</strong> {question.explanation}
                          </div>
                        }
                        type={userAnswers[question._id] === question.correctAnswer ? "success" : "error"}
                        showIcon
                        style={{ marginTop: '16px', borderRadius: '8px' }}
                      />
                    )}
                  </Card>
                ))}
              </Space>
            )}

            {/* Submit Button */}
            {quizStarted && !isSubmitted && (
              <Card
                style={{
                  marginTop: '32px',
                  textAlign: 'center',
                  position: 'sticky',
                  bottom: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSubmit}
                  disabled={answeredCount < currentQuestions.length}
                  style={{
                    minWidth: '200px',
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderRadius: '24px'
                  }}
                >
                  Nộp bài ({answeredCount}/{currentQuestions.length})
                </Button>
                <br />
                <Text type="danger" style={{ marginTop: '12px', fontSize: '14px' }}>
                  {answeredCount < currentQuestions.length
                    ? `Bạn cần trả lời tất cả ${currentQuestions.length} câu trước khi nộp bài`
                    : 'Đã hoàn thành tất cả câu hỏi, bạn có thể nộp bài'}
                </Text>

              </Card>
            )}
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default PracticeQuizApp;