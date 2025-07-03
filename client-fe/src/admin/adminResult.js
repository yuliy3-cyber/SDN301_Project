import React, { useState } from "react";
import axios from "axios";
import ReactECharts from "echarts-for-react";
import {
  Card,
  Input,
  Button,
  Table,
  Typography,
  Space,
  Spin,
  Alert,
  Statistic,
  Row,
  Col,
  Tag,
  Avatar,
  Divider,
  Empty
} from "antd";
import {
  SearchOutlined,
  BarChartOutlined,
  UserOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  FileTextOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Search } = Input;

const AdminResults = () => {
  const [code, setCode] = useState("");
  const [results, setResults] = useState([]);
  const [examTitle, setExamTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchResults = async (searchCode) => {
    const codeToSearch = searchCode || code;
    if (!codeToSearch.trim()) {
      setError("Vui lòng nhập mã đề");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`http://localhost:9999/admin/results?code=${codeToSearch}`);
      setResults(res.data.results);
      setExamTitle(res.data.examTitle);
    } catch (err) {
      setError("Không tìm thấy kết quả cho mã đề này");
      setResults([]);
      setExamTitle("");
    }
    setLoading(false);
  };

  // Tính toán thống kê
  const getStatistics = () => {
    if (results.length === 0) return {};

    const scores = results.map(r => r.score);
    const userScores = {};
    
    results.forEach((r) => {
      if (!userScores[r.username]) {
        userScores[r.username] = 0;
      }
      userScores[r.username] += r.score;
    });

    return {
      totalStudents: Object.keys(userScores).length,
      totalSubmissions: results.length,
      averageScore: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
      maxScore: Math.max(...scores),
      minScore: Math.min(...scores),
      userScores
    };
  };

  const statistics = getStatistics();

  // Cấu hình biểu đồ cột 3D đẹp
  const getBarChartOption = () => {
    if (!statistics.userScores) return {};

    const sortedUsers = Object.entries(statistics.userScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    return {
      backgroundColor: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
          offset: 0, color: '#f7f9fc'
        }, {
          offset: 1, color: '#ffffff'
        }]
      },
      title: {
        text: "Top 10 Học Sinh Xuất Sắc",
        left: "center",
        top: "20"
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        },
        backgroundColor: "rgba(0,0,0,0.8)",
        borderColor: "#fff",
        borderWidth: 1,
        textStyle: {
          color: "#fff"
        },
        formatter: function(params) {
          const rank = params[0].dataIndex + 1;
          const rankEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🏅";
          return `${rankEmoji} <b>${params[0].name}</b><br/>Tổng điểm: <b style="color:#ffd700">${params[0].value}</b> điểm<br/>Xếp hạng: <b>#${rank}</b>`;
        }
      },
      legend: {
        show: false
      },
      grid: {
        left: "5%",
        right: "5%",
        bottom: "15%",
        top: "20%",
        containLabel: true
      },
      xAxis: {
        type: "category",
        data: sortedUsers.map(([name]) => name),
        axisLabel: {
          interval: 0,
          rotate: 30
        },
        axisLine: {
          lineStyle: {
            color: "#3498db"
          }
        },
        axisTick: {
          alignWithLabel: true,
          lineStyle: {
            color: "#3498db"
          }
        }
      },
      yAxis: {
        type: "value",
        name: "Điểm số"
      },
      series: [
        {
          name: "Điểm số",
          type: "bar",
          data: sortedUsers.map(([, score], index) => ({
            value: score,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0,
                  color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#4ECDC4'
                }, {
                  offset: 1,
                  color: index === 0 ? '#FFA500' : index === 1 ? '#A9A9A9' : index === 2 ? '#8B4513' : '#45B7D1'
                }]
              },
              borderRadius: [4, 4, 0, 0],
              shadowColor: 'rgba(0, 0, 0, 0.3)',
              shadowBlur: 8,
              shadowOffsetY: 4
            }
          })),
          barWidth: '60%',
          emphasis: {
            itemStyle: {
              shadowBlur: 15,
              shadowOffsetX: 0,
              shadowOffsetY: 8,
              shadowColor: "rgba(0, 0, 0, 0.4)"
            }
          },
          animationDelay: function (idx) {
            return idx * 100;
          }
        }
      ],
      animationEasing: 'elasticOut',
      animationDelayUpdate: function (idx) {
        return idx * 50;
      }
    };
  };

  // Biểu đồ phân bố điểm
  const getScoreDistributionOption = () => {
    if (results.length === 0) return {};

    const scoreRanges = {
      'Xuất sắc (9-10)': 0,
      'Giỏi (8-8.9)': 0,
      'Khá (7-7.9)': 0,
      'Trung bình (6-6.9)': 0,
      'Yếu (5-5.9)': 0,
      'Kém (<5)': 0
    };

    results.forEach(r => {
      if (r.score >= 9) scoreRanges['Xuất sắc (9-10)']++;
      else if (r.score >= 8) scoreRanges['Giỏi (8-8.9)']++;
      else if (r.score >= 7) scoreRanges['Khá (7-7.9)']++;
      else if (r.score >= 6) scoreRanges['Trung bình (6-6.9)']++;
      else if (r.score >= 5) scoreRanges['Yếu (5-5.9)']++;
      else scoreRanges['Kém (<5)']++;
    });

    return {
      backgroundColor: {
        type: 'radial',
        x: 0.5,
        y: 0.5,
        r: 0.5,
        colorStops: [{
          offset: 0, color: '#ffffff'
        }, {
          offset: 1, color: '#f8f9fa'
        }]
      },
      title: {
        text: "Phân Bố Điểm Số",
        left: "center",
        top: "20"
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: "rgba(0,0,0,0.8)",
        borderColor: "#fff",
        borderWidth: 1,
        textStyle: {
          color: "#fff"
        },
        formatter: function(params) {
          const percentage = ((params.value / results.length) * 100).toFixed(1);
          return `${params.name}<br/>Số lượng: <b>${params.value}</b> học sinh<br/>Tỷ lệ: <b>${percentage}%</b>`;
        }
      },
      legend: {
        orient: 'horizontal',
        bottom: '10'
      },
      series: [
        {
          type: 'pie',
          radius: ['30%', '70%'],
          center: ['50%', '50%'],
          data: Object.entries(scoreRanges).map(([name, value]) => ({
            name,
            value,
            itemStyle: {
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowBlur: 10
            }
          })),
          roseType: 'area',
          itemStyle: {
            borderRadius: 8
          },
          label: {
            fontSize: 12
          },
          labelLine: {
            length: 15,
            length2: 25,
            smooth: true
          },
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: function (idx) {
            return Math.random() * 200;
          }
        }
      ],
      color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3', '#54a0ff']
    };
  };

  // Biểu đồ line chart theo thời gian
  const getTimelineChartOption = () => {
    if (results.length === 0) return {};

    const sortedResults = [...results].sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
    const timeData = sortedResults.map(r => new Date(r.submittedAt).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }));
    const scoreData = sortedResults.map(r => r.score);
    const nameData = sortedResults.map(r => r.username);

    return {
      backgroundColor: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 1,
        y2: 1,
        colorStops: [{
          offset: 0, color: '#667eea'
        }, {
          offset: 1, color: '#764ba2'
        }]
      },
      title: {
        text: "Điểm Số Theo Thời Gian Nộp Bài",
        left: "center",
        top: "20",
        textStyle: {
          color: "#ffffff"
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: "rgba(0,0,0,0.8)",
        borderColor: "#fff",
        borderWidth: 1,
        textStyle: {
          color: "#fff"
        },
        formatter: function(params) {
          const point = params[0];
          return `🕐 ${point.axisValue}<br/>👤 <b>${nameData[point.dataIndex]}</b><br/>📊 Điểm: <b>${point.value}</b>`;
        }
      },
      grid: {
        left: "5%",
        right: "5%",
        bottom: "15%",
        top: "20%",
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: timeData,
        axisLabel: {
          textStyle: {
            color: '#ffffff'
          }
        },
        axisLine: {
          lineStyle: {
            color: '#ffffff'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'Điểm số',
        nameTextStyle: {
          color: '#ffffff'
        },
        axisLabel: {
          textStyle: {
            color: '#ffffff'
          }
        },
        axisLine: {
          lineStyle: {
            color: '#ffffff'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.1)'
          }
        }
      },
      series: [
        {
          type: 'line',
          data: scoreData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: '#ffd700',
            width: 3,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 10,
            shadowOffsetY: 5
          },
          itemStyle: {
            color: '#ffd700',
            borderColor: '#ffffff',
            borderWidth: 2,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 10
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(255, 215, 0, 0.3)'
              }, {
                offset: 1, color: 'rgba(255, 215, 0, 0.05)'
              }]
            }
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(255, 215, 0, 0.8)'
            }
          }
        }
      ]
    };
  };

  // Cấu hình bảng
  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      width: 60,
      render: (_, __, index) => (
        <Avatar size="small" style={{ backgroundColor: "#1890ff" }}>
          {index + 1}
        </Avatar>
      )
    },
    {
      title: "Học sinh",
      dataIndex: "username",
      key: "username",
      render: (text) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <Text type="secondary">{text}</Text>
    },
    {
      title: "Điểm số",
      dataIndex: "score",
      key: "score",
      sorter: (a, b) => a.score - b.score,
      render: (score) => {
        let color = "default";
        if (score >= 8) color = "success";
        else if (score >= 6) color = "warning";
        else if (score < 5) color = "error";
        
        return <Tag color={color}>{score} điểm</Tag>;
      }
    },
    {
      title: "Thời gian nộp",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (time) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{new Date(time).toLocaleString("vi-VN")}</Text>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card>
        <Title level={2} style={{ textAlign: "center", marginBottom: "32px" }}>
          <BarChartOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
          Thống Kê Kết Quả Bài Thi
        </Title>

        <Card style={{ marginBottom: "24px" }}>
          <Search
            placeholder="Nhập mã đề (ví dụ: REACT-MID)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onSearch={fetchResults}
            enterButton={
              <Button type="primary" icon={<SearchOutlined />}>
                Tìm kiếm
              </Button>
            }
            size="large"
            loading={loading}
          />
        </Card>

        {error && (
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: "24px" }}
          />
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
            <div style={{ marginTop: "16px" }}>
              <Text>Đang tải dữ liệu...</Text>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Tiêu đề đề thi */}
            <Card>
              <Title level={3} style={{ textAlign: "center", margin: 0 }}>
                <FileTextOutlined style={{ marginRight: "8px", color: "#52c41a" }} />
                {examTitle}
              </Title>
            </Card>

            {/* Thống kê tổng quan */}
            <Card title="Thống kê tổng quan">
              <Row gutter={16}>
                <Col xs={12} sm={8} md={6}>
                  <Statistic
                    title="Số học sinh"
                    value={statistics.totalStudents}
                    prefix={<UserOutlined />}
                  />
                </Col>
                <Col xs={12} sm={8} md={6}>
                  <Statistic
                    title="Tổng bài nộp"
                    value={statistics.totalSubmissions}
                    prefix={<FileTextOutlined />}
                  />
                </Col>
                <Col xs={12} sm={8} md={6}>
                  <Statistic
                    title="Điểm trung bình"
                    value={statistics.averageScore}
                    suffix="điểm"
                    precision={1}
                  />
                </Col>
                <Col xs={12} sm={8} md={6}>
                  <Statistic
                    title="Điểm cao nhất"
                    value={statistics.maxScore}
                    prefix={<TrophyOutlined />}
                    suffix="điểm"
                    valueStyle={{ color: "#cf1322" }}
                  />
                </Col>
              </Row>
            </Card>

            {/* Biểu đồ tổng hợp */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Bảng xếp hạng" style={{ height: "500px" }}>
                  <ReactECharts 
                    option={getBarChartOption()} 
                    style={{ height: "420px" }}
                    opts={{ renderer: "canvas" }}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Phân bố điểm số" style={{ height: "500px" }}>
                  <ReactECharts 
                    option={getScoreDistributionOption()} 
                    style={{ height: "420px" }}
                    opts={{ renderer: "canvas" }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Biểu đồ timeline */}
            <Card title="Thời gian nộp bài">
              <ReactECharts 
                option={getTimelineChartOption()} 
                style={{ height: "400px" }}
                opts={{ renderer: "canvas" }}
              />
            </Card>

            {/* Bảng kết quả chi tiết */}
            <Card title="Kết quả chi tiết">
              <Table
                columns={columns}
                dataSource={results.map((item, index) => ({ ...item, key: index }))}
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} kết quả`,
                  defaultPageSize: 10,
                  pageSizeOptions: ["10", "20", "50", "100"]
                }}
                scroll={{ x: 800 }}
                size="middle"
              />
            </Card>
          </Space>
        )}

        {results.length === 0 && !loading && examTitle && (
          <Empty
            description="Không có học sinh nào làm đề này"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </div>
  );
};

export default AdminResults;