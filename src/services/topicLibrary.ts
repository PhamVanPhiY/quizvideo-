import type { QuizItem } from '../types/quiz';

export interface TopicPreset {
  id: string;
  title: string;
  category: string;
  description: string;
  iconName: string;
  badge: string;
  isVipOnly?: boolean;
  questionCount: number;
  questions: QuizItem[];
}

export const TOPIC_PRESETS: TopicPreset[] = [
  {
    id: 'confusing-words',
    title: '100 Cặp Từ Dễ Nhầm Lẫn Nhất',
    category: 'TỪ VỰNG DỄ NHẦM LẪN',
    description: 'Phân biệt chính xác các cặp từ đồng âm hoặc viết gần giống nhau nhưng nghĩa hoàn toàn khác nhau.',
    iconName: 'Sparkles',
    badge: 'Miễn Phí',
    isVipOnly: false,
    questionCount: 5,
    questions: [
      {
        id: 'cf-1',
        channelName: 'BIN HỌC TIẾNG ANH',
        category: 'TỪ VỰNG DỄ NHẦM LẪN',
        word: 'GOODS',
        ipa: '/ɡʊdz/',
        question: 'nghĩa là gì?',
        options: [
          { key: 'A', text: 'Tốt' },
          { key: 'B', text: 'Hàng hóa' },
          { key: 'C', text: 'Món ăn' },
          { key: 'D', text: 'Sự tốt bụng' }
        ],
        correctAnswer: 'B',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Good (Tính từ) = Tốt | Goods (Danh từ) = Hàng hóa',
        explanation: 'Goods = Hàng hóa, mặt hàng sản phẩm (Danh từ số nhiều)',
        example: 'The company produces high-tech goods.',
        exampleMeaning: 'Công ty sản xuất các mặt hàng công nghệ cao.'
      },
      {
        id: 'cf-2',
        channelName: 'BIN HỌC TIẾNG ANH',
        category: 'PHÂN BIỆT TỪ ĐỒNG ÂM',
        word: 'DESSERT',
        ipa: '/dɪˈzɜːt/',
        question: 'nghĩa là gì?',
        options: [
          { key: 'A', text: 'Sa mạc' },
          { key: 'B', text: 'Rời bỏ' },
          { key: 'C', text: 'Món tráng miệng' },
          { key: 'D', text: 'Khu rừng' }
        ],
        correctAnswer: 'C',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Desert (1 chữ S) = Sa mạc | Dessert (2 chữ S) = Tráng miệng',
        explanation: 'Dessert = Món tráng miệng (Bánh ngọt, kem, hoa quả)',
        example: 'What would you like for dessert?',
        exampleMeaning: 'Bạn muốn dùng món gì cho tráng miệng?'
      },
      {
        id: 'cf-3',
        channelName: 'BIN HỌC TIẾNG ANH',
        category: 'TỪ VỰNG DỄ NHẦM LẪN',
        word: 'COMPLIMENT',
        ipa: '/ˈkɒm.plɪ.mənt/',
        question: 'nghĩa là gì?',
        options: [
          { key: 'A', text: 'Lời khen ngợi' },
          { key: 'B', text: 'Bổ sung / Hoàn thiện' },
          { key: 'C', text: 'Phàn nàn' },
          { key: 'D', text: 'Phức tạp' }
        ],
        correctAnswer: 'A',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Compliment (chữ i) = Lời khen | Complement (chữ e) = Bổ sung',
        explanation: 'Compliment = Lời khen, lời ca ngợi tán dương',
        example: 'He gave her a nice compliment on her presentation.',
        exampleMeaning: 'Anh ấy đã dành cho cô ấy một lời khen ngợi về bài thuyết trình.'
      },
      {
        id: 'cf-4',
        channelName: 'BIN HỌC TIẾNG ANH',
        category: 'TỪ NHIỀU NGHĨA',
        word: 'BEAR (v)',
        ipa: '/beər/',
        question: 'mang ý nghĩa nào sau đây?',
        options: [
          { key: 'A', text: 'Con gấu' },
          { key: 'B', text: 'Chịu đựng / Gánh vác' },
          { key: 'C', text: 'Sinh nở' },
          { key: 'D', text: 'Cả B và C đều đúng' }
        ],
        correctAnswer: 'D',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Danh từ: Con gấu | Động từ: Chịu đựng, sinh con',
        explanation: 'Bear (v) = Chịu đựng (I can\'t bear it) hoặc Sinh con (Bear a child)',
        example: 'She couldn\'t bear the pain any longer.',
        exampleMeaning: 'Cô ấy không thể chịu đựng cơn đau thêm được nữa.'
      },
      {
        id: 'cf-5',
        channelName: 'BIN HỌC TIẾNG ANH',
        category: 'NGỮ PHÁP TIẾNG ANH',
        word: 'EVERYDAY',
        ipa: '/ˈev.ri.deɪ/',
        question: 'là loại từ gì & nghĩa là gì?',
        options: [
          { key: 'A', text: 'Trạng từ: Mỗi ngày' },
          { key: 'B', text: 'Tính từ: Thông thường / Hàng ngày' },
          { key: 'C', text: 'Danh từ: Ngày hôm nay' },
          { key: 'D', text: 'Liên từ: Bất kỳ ngày nào' }
        ],
        correctAnswer: 'B',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Everyday (dính liền) = Tính từ | Every day (cách rời) = Trạng từ',
        explanation: 'Everyday (adj) đứng trước danh từ: everyday problems',
        example: 'Traffic jams are an everyday problem in the city.',
        exampleMeaning: 'Kẹt xe là vấn đề thường ngày ở thành phố.'
      }
    ]
  },
  {
    id: 'toeic-650',
    title: 'Từ Vựng TOEIC 650+ Trọng Tâm',
    category: 'TIẾNG ANH DOANH NGHIỆP & TOEIC',
    description: 'Các từ vựng cốt lõi thường xuyên xuất hiện nhất trong đề thi TOEIC Part 5, 6, 7.',
    iconName: 'Briefcase',
    badge: 'VIP Pro',
    isVipOnly: true,
    questionCount: 5,
    questions: [
      {
        id: 'toeic-1',
        channelName: 'BIN TOEIC ACADEMY',
        category: 'TỪ VỰNG TOEIC 650+',
        word: 'REVENUE',
        ipa: '/ˈrev.ən.juː/',
        question: 'nghĩa là gì trong kinh doanh?',
        options: [
          { key: 'A', text: 'Chi phí đầu tư' },
          { key: 'B', text: 'Doanh thu' },
          { key: 'C', text: 'Lợi nhuận ròng' },
          { key: 'D', text: 'Hợp đồng' }
        ],
        correctAnswer: 'B',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Revenue = Doanh thu | Profit = Lợi nhuận (Profit = Revenue - Cost)',
        explanation: 'Revenue = Tổng doanh thu thu về từ việc bán hàng/dịch vụ',
        example: 'The company reported a 20% increase in annual revenue.',
        exampleMeaning: 'Công ty đã báo cáo mức tăng trưởng 20% doanh thu hàng năm.'
      },
      {
        id: 'toeic-2',
        channelName: 'BIN TOEIC ACADEMY',
        category: 'TỪ VỰNG TOEIC 650+',
        word: 'NEGOTIATE',
        ipa: '/nəˈɡəʊ.ʃi.eɪt/',
        question: 'nghĩa là gì?',
        options: [
          { key: 'A', text: 'Đàm phán / Thương lượng' },
          { key: 'B', text: 'Ký kết' },
          { key: 'C', text: 'Hủy bỏ thỏa thuận' },
          { key: 'D', text: 'Từ chối' }
        ],
        correctAnswer: 'A',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Negotiate (v) = Đàm phán | Negotiation (n) = Cuộc đàm phán',
        explanation: 'Negotiate = Thảo luận để đạt được thỏa thuận chung',
        example: 'We need to negotiate a new contract with our suppliers.',
        exampleMeaning: 'Chúng ta cần đàm phán một hợp đồng mới với các nhà cung cấp.'
      },
      {
        id: 'toeic-3',
        channelName: 'BIN TOEIC ACADEMY',
        category: 'TỪ VỰNG TOEIC 650+',
        word: 'IMPLEMENT',
        ipa: '/ˈɪm.plɪ.ment/',
        question: 'nghĩa là gì?',
        options: [
          { key: 'A', text: 'Lên kế hoạch' },
          { key: 'B', text: 'Triển khai / Thi hành' },
          { key: 'C', text: 'Đánh giá' },
          { key: 'D', text: 'Hoãn lại' }
        ],
        correctAnswer: 'B',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Implement policy / plan / strategy = Thi hành chính sách / kế hoạch',
        explanation: 'Implement = Đưa một quyết định hoặc kế hoạch vào thực hiện',
        example: 'The management will implement new safety rules next month.',
        exampleMeaning: 'Ban quản lý sẽ triển khai các quy định an toàn mới vào tháng tới.'
      },
      {
        id: 'toeic-4',
        channelName: 'BIN TOEIC ACADEMY',
        category: 'TỪ VỰNG TOEIC 650+',
        word: 'AGENDA',
        ipa: '/əˈdʒen.də/',
        question: 'nghĩa là gì trong cuộc họp?',
        options: [
          { key: 'A', text: 'Biên bản cuộc họp' },
          { key: 'B', text: 'Chương trình nghị sự / Lịch trình' },
          { key: 'C', text: 'Thành viên tham dự' },
          { key: 'D', text: 'Báo cáo tài chính' }
        ],
        correctAnswer: 'B',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Agenda = Danh sách các chủ đề sẽ bàn bạc trong cuộc họp',
        explanation: 'Agenda = Chương trình làm việc / Các mục cần thảo luận',
        example: 'What is the first item on today\'s agenda?',
        exampleMeaning: 'Chủ đề đầu tiên trong chương trình họp hôm nay là gì?'
      },
      {
        id: 'toeic-5',
        channelName: 'BIN TOEIC ACADEMY',
        category: 'TỪ VỰNG TOEIC 650+',
        word: 'COMPENSATION',
        ipa: '/ˌkɒm.penˈseɪ.ʃən/',
        question: 'nghĩa là gì?',
        options: [
          { key: 'A', text: 'Tiền thưởng' },
          { key: 'B', text: 'Sự đền bù / Thù lao bồi thường' },
          { key: 'C', text: 'Khuyến mãi' },
          { key: 'D', text: 'Học bổng' }
        ],
        correctAnswer: 'B',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Compensation package = Chế độ đãi ngộ (Lương + Thưởng + Quyền lợi)',
        explanation: 'Compensation = Khoản tiền đền bù thiệt hại hoặc tiền lương thù lao',
        example: 'She received financial compensation for the flight delay.',
        exampleMeaning: 'Cô ấy đã nhận được tiền bồi thường cho việc chuyến bay bị hoãn.'
      }
    ]
  },
  {
    id: 'ielts-75',
    title: 'Từ Vựng IELTS 7.5+ Band Điểm Cao',
    category: 'ACADEMIC IELTS VOCABULARY',
    description: 'Các từ vựng học thuật đỉnh cao giúp nâng band điểm IELTS Speaking & Writing.',
    iconName: 'GraduationCap',
    badge: 'VIP Pro',
    isVipOnly: true,
    questionCount: 5,
    questions: [
      {
        id: 'ielts-1',
        channelName: 'IELTS MASTER 8.0',
        category: 'IELTS BAND 7.5+',
        word: 'UBIQUITOUS',
        ipa: '/juːˈbɪk.wɪ.təs/',
        question: 'nghĩa là gì?',
        options: [
          { key: 'A', text: 'Hiếm gặp' },
          { key: 'B', text: 'Phổ biến khắp nơi' },
          { key: 'C', text: 'Độc quyền' },
          { key: 'D', text: 'Lỗi thời' }
        ],
        correctAnswer: 'B',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Ubiquitous = Present everywhere (Có mặt ở mọi nơi)',
        explanation: 'Ubiquitous = Phổ biến rộng rãi khắp nơi (Cực hay trong Writing)',
        example: 'Smartphones have become ubiquitous in modern society.',
        exampleMeaning: 'Điện thoại thông minh đã trở nên phổ biến khắp mọi nơi trong xã hội hiện đại.'
      },
      {
        id: 'ielts-2',
        channelName: 'IELTS MASTER 8.0',
        category: 'IELTS BAND 7.5+',
        word: 'EPHEMERAL',
        ipa: '/ɪˈfem.ər.əl/',
        question: 'nghĩa là gì?',
        options: [
          { key: 'A', text: 'Vĩnh cửu' },
          { key: 'B', text: 'Phù du / Chóng tàn' },
          { key: 'C', text: 'Nguy hiểm' },
          { key: 'D', text: 'Rực rỡ' }
        ],
        correctAnswer: 'B',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Ephemeral = Lasting for a very short time (Ngắn ngủi, tạm thời)',
        explanation: 'Ephemeral = Mang tính phù du, chỉ tồn tại trong thoáng chốc',
        example: 'Fame in the digital age can be very ephemeral.',
        exampleMeaning: 'Sự nổi tiếng trong thời đại kỹ thuật số có thể rất ngắn ngủi.'
      },
      {
        id: 'ielts-3',
        channelName: 'IELTS MASTER 8.0',
        category: 'IELTS BAND 7.5+',
        word: 'METICULOUS',
        ipa: '/məˈtɪk.jə.ləs/',
        question: 'nghĩa là gì?',
        options: [
          { key: 'A', text: 'Tỉ mỉ / Cẩn thận từng chi tiết' },
          { key: 'B', text: 'Cẩu thả' },
          { key: 'C', text: 'Nóng vội' },
          { key: 'D', text: 'Nghi ngờ' }
        ],
        correctAnswer: 'A',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Meticulous attention to detail = Sự chú ý cực kỳ tỉ mỉ đến từng chi tiết',
        explanation: 'Meticulous = Rất kỹ lưỡng, trau chuốt và chuẩn xác',
        example: 'He is meticulous about keeping his financial records.',
        exampleMeaning: 'Anh ấy rất tỉ mỉ trong việc ghi chép các sổ sách tài chính.'
      },
      {
        id: 'ielts-4',
        channelName: 'IELTS MASTER 8.0',
        category: 'IELTS BAND 7.5+',
        word: 'PRAGMATIC',
        ipa: '/præɡˈmæt.ɪk/',
        question: 'nghĩa là gì?',
        options: [
          { key: 'A', text: 'Lý thuyết suông' },
          { key: 'B', text: 'Thực tế / Thực dụng hữu ích' },
          { key: 'C', text: 'Mơ mộng' },
          { key: 'D', text: 'Bảo thủ' }
        ],
        correctAnswer: 'B',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Pragmatic approach = Cách tiếp cận thực tế, thực tiễn',
        explanation: 'Pragmatic = Giải quyết vấn đề dựa trên thực tế thay vì lý thuyết',
        example: 'We need a pragmatic solution to this traffic problem.',
        exampleMeaning: 'Chúng ta cần một giải pháp thực tế cho vấn đề giao thông này.'
      },
      {
        id: 'ielts-5',
        channelName: 'IELTS MASTER 8.0',
        category: 'IELTS BAND 7.5+',
        word: 'AMBIGUOUS',
        ipa: '/æmˈbɪɡ.ju.əs/',
        question: 'nghĩa là gì?',
        options: [
          { key: 'A', text: 'Rõ ràng minh bạch' },
          { key: 'B', text: 'Mơ hồ / Đa nghĩa / Không rõ ràng' },
          { key: 'C', text: 'Chính xác' },
          { key: 'D', text: 'Đơn giản' }
        ],
        correctAnswer: 'B',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Ambiguous statement = Lời tuyên bố mập mờ, khó hiểu',
        explanation: 'Ambiguous = Có thể hiểu theo nhiều nghĩa, gây khó hiểu',
        example: 'The government\'s response was ambiguous.',
        exampleMeaning: 'Phản hồi của chính phủ mang tính mơ hồ, không rõ ràng.'
      }
    ]
  },
  {
    id: 'idioms-phrasal',
    title: 'Thành Ngữ & Phrasal Verbs Thông Dụng',
    category: 'THÀNH NGỮ TIẾNG ANH GIAO TIẾP',
    description: 'Các câu thành ngữ tự nhiên người bản xứ hay dùng nhất trong phim ảnh và đời sống.',
    iconName: 'Flame',
    badge: 'VIP Pro',
    isVipOnly: true,
    questionCount: 5,
    questions: [
      {
        id: 'id-1',
        channelName: 'ENGLISH FOR LIFE',
        category: 'THÀNH NGỮ TIẾNG ANH',
        word: 'BREAK A LEG',
        ipa: '/breɪk ə leɡ/',
        question: 'thực chất mang ý nghĩa gì?',
        options: [
          { key: 'A', text: 'Bị gãy chân' },
          { key: 'B', text: 'Chúc may mắn / Thành công nhé!' },
          { key: 'C', text: 'Hãy cẩn thận' },
          { key: 'D', text: 'Bỏ cuộc đi' }
        ],
        correctAnswer: 'B',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Dùng chúc may mắn trước buổi biểu diễn, phỏng vấn, thi cử',
        explanation: 'Break a leg = Lời chúc may mắn dí dỏm của người bản xứ',
        example: 'You have a big presentation today. Break a leg!',
        exampleMeaning: 'Hôm nay bạn có bài thuyết trình lớn đấy. Chúc may mắn nhé!'
      },
      {
        id: 'id-2',
        channelName: 'ENGLISH FOR LIFE',
        category: 'THÀNH NGỮ TIẾNG ANH',
        word: 'BITE THE BULLET',
        ipa: '/baɪt ðə ˈbʊl.ɪt/',
        question: 'nghĩa là gì?',
        options: [
          { key: 'A', text: 'Cắn viên đạn' },
          { key: 'B', text: 'Nghiến răng chấp nhận điều khó khăn' },
          { key: 'C', text: 'Bắn súng' },
          { key: 'D', text: 'Tức giận' }
        ],
        correctAnswer: 'B',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Bite the bullet = Dũng cảm đối mặt với việc khó nhưng bắt buộc phải làm',
        explanation: 'Bite the bullet = Quyết định làm một việc khó khăn mà mình từng né tránh',
        example: 'I decided to bite the bullet and talk to my boss about a raise.',
        exampleMeaning: 'Tôi quyết định nghiến răng nói chuyện với sếp về việc tăng lương.'
      },
      {
        id: 'id-3',
        channelName: 'ENGLISH FOR LIFE',
        category: 'THÀNH NGỮ TIẾNG ANH',
        word: 'CALL IT A DAY',
        ipa: '/kɔːl ɪt ə deɪ/',
        question: 'nghĩa là gì khi đi làm?',
        options: [
          { key: 'A', text: 'Gọi điện thoại' },
          { key: 'B', text: 'Nghỉ tay / Kết thúc công việc hôm nay' },
          { key: 'C', text: 'Tăng ca' },
          { key: 'D', text: 'Họp khẩn cấp' }
        ],
        correctAnswer: 'B',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Let\'s call it a day = Hôm nay dừng ở đây nhé, mai làm tiếp!',
        explanation: 'Call it a day = Quyết định dừng công việc của ngày hôm đó',
        example: 'We have been working for 8 hours. Let\'s call it a day.',
        exampleMeaning: 'Chúng ta đã làm việc 8 tiếng rồi. Nghỉ tay hôm nay thôi nào.'
      },
      {
        id: 'id-4',
        channelName: 'ENGLISH FOR LIFE',
        category: 'PHRASAL VERBS',
        word: 'LOOK FORWARD TO',
        ipa: '/lʊk ˈfɔː.wəd tuː/',
        question: 'nghĩa là gì & đi với từ loại nào?',
        options: [
          { key: 'A', text: 'Nhìn về phía trước + V-nguyên thể' },
          { key: 'B', text: 'Háo hức mong đợi + V-ing' },
          { key: 'C', text: 'Tìm kiếm + Danh từ' },
          { key: 'D', text: 'Xem xét + V-nguyên thể' }
        ],
        correctAnswer: 'B',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Cấu trúc bắt buộc: Look forward to + V-ING (hoặc Noun)',
        explanation: 'Look forward to = Háo hức mong chờ một điều tốt đẹp sắp tới',
        example: 'I am looking forward to hearing from you soon.',
        exampleMeaning: 'Tôi rất mong sớm nhận được phản hồi từ bạn.'
      },
      {
        id: 'id-5',
        channelName: 'ENGLISH FOR LIFE',
        category: 'THÀNH NGỮ TIẾNG ANH',
        word: 'UNDER THE WEATHER',
        ipa: '/ˈʌn.dər ðə ˈweð.ər/',
        question: 'nghĩa là gì?',
        options: [
          { key: 'A', text: 'Thời tiết xấu' },
          { key: 'B', text: 'Cảm thấy không khỏe / Ốm nhẹ' },
          { key: 'C', text: 'Trú mưa' },
          { key: 'D', text: 'Rất vui vẻ' }
        ],
        correctAnswer: 'B',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Feel under the weather = Cảm thấy mệt mỏi, uể oải, sốt nhẹ',
        explanation: 'Under the weather = Cảm thấy sức khỏe không được tốt',
        example: 'I am feeling a bit under the weather today.',
        exampleMeaning: 'Hôm nay tôi cảm thấy hơi mệt trong người.'
      }
    ]
  },
  {
    id: 'travel-hotel',
    title: 'Từ Vựng Du Lịch, Sân Bay & Khách Sạn',
    category: 'TIẾNG ANH DU LỊCH QUỐC TẾ',
    description: 'Từ vựng sinh tồn khi đi nước ngoài, làm thủ tục hải quan và đặt phòng khách sạn.',
    iconName: 'Plane',
    badge: 'VIP Pro',
    isVipOnly: true,
    questionCount: 5,
    questions: [
      {
        id: 'tr-1',
        channelName: 'ENGLISH TRAVELER',
        category: 'TIẾNG ANH SÂN BAY',
        word: 'BOARDING PASS',
        ipa: '/ˈbɔː.dɪŋ ˌpɑːs/',
        question: 'nghĩa là gì tại sân bay?',
        options: [
          { key: 'A', text: 'Hộ chiếu' },
          { key: 'B', text: 'Thẻ lên máy bay' },
          { key: 'C', text: 'Hành lý ký gửi' },
          { key: 'D', text: 'Vé phạt quá cước' }
        ],
        correctAnswer: 'B',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Passport = Hộ chiếu | Boarding pass = Thẻ lên máy bay',
        explanation: 'Boarding pass = Thẻ xuất trình để qua cửa an ninh và lên máy bay',
        example: 'Please show your passport and boarding pass at the gate.',
        exampleMeaning: 'Vui lòng xuất trình hộ chiếu và thẻ lên máy bay tại cửa khởi hành.'
      },
      {
        id: 'tr-2',
        channelName: 'ENGLISH TRAVELER',
        category: 'TIẾNG ANH DU LỊCH',
        word: 'ITINERARY',
        ipa: '/aɪˈtɪn.ər.ər.i/',
        question: 'nghĩa là gì?',
        options: [
          { key: 'A', text: 'Lịch trình / Hành trình chuyến đi' },
          { key: 'B', text: 'Bản đồ du lịch' },
          { key: 'C', text: 'Hóa đơn khách sạn' },
          { key: 'D', text: 'Đại lý tour' }
        ],
        correctAnswer: 'A',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Travel itinerary = Lịch trình chi tiết các điểm sẽ đi',
        explanation: 'Itinerary = Kế hoạch chi tiết của một chuyến hành trình',
        example: 'We have a very tight itinerary for our trip to Paris.',
        exampleMeaning: 'Chúng tôi có một lịch trình khá bận rộn cho chuyến đi Paris.'
      },
      {
        id: 'tr-3',
        channelName: 'ENGLISH TRAVELER',
        category: 'TIẾNG ANH KHÁCH SẠN',
        word: 'COMPLIMENTARY',
        ipa: '/ˌkɒm.plɪˈmen.tər.i/',
        question: 'nghĩa là gì trên biển báo khách sạn?',
        options: [
          { key: 'A', text: 'Có tính phí phụ thu' },
          { key: 'B', text: 'Miễn phí (Tặng kèm)' },
          { key: 'C', text: 'Khu vực cấm' },
          { key: 'D', text: 'Dành riêng cho nhân viên' }
        ],
        correctAnswer: 'B',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Complimentary breakfast / wifi = Bữa sáng / wifi hoàn toàn miễn phí',
        explanation: 'Complimentary = Được cung cấp miễn phí kèm theo dịch vụ',
        example: 'The hotel offers complimentary breakfast and shuttle service.',
        exampleMeaning: 'Khách sạn cung cấp bữa sáng và dịch vụ xe đưa đón miễn phí.'
      },
      {
        id: 'tr-4',
        channelName: 'ENGLISH TRAVELER',
        category: 'TIẾNG ANH SÂN BAY',
        word: 'BAGGAGE CLAIM',
        ipa: '/ˈbæɡ.ɪdʒ ˌkleɪm/',
        question: 'nghĩa là khu vực nào?',
        options: [
          { key: 'A', text: 'Khu gửi đồ' },
          { key: 'B', text: 'Khu vực băng chuyền lấy hành lý' },
          { key: 'C', text: 'Khu kiểm tra an ninh' },
          { key: 'D', text: 'Phòng chờ hạng thương gia' }
        ],
        correctAnswer: 'B',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Baggage claim = Nơi hành khách nhận lại hành lý sau khi hạ cánh',
        explanation: 'Baggage claim = Khu vực lấy lại hành lý ký gửi tại sân bay đến',
        example: 'Proceed to the baggage claim area to collect your suitcases.',
        exampleMeaning: 'Hãy di chuyển đến khu vực nhận hành lý để lấy vali của bạn.'
      },
      {
        id: 'tr-5',
        channelName: 'ENGLISH TRAVELER',
        category: 'TIẾNG ANH DU LỊCH',
        word: 'RESERVATION',
        ipa: '/ˌrez.əˈveɪ.ʃən/',
        question: 'nghĩa là gì?',
        options: [
          { key: 'A', text: 'Sự đặt chỗ trước (Phòng / Bàn)' },
          { key: 'B', text: 'Sự hủy bỏ' },
          { key: 'C', text: 'Sự hoàn tiền' },
          { key: 'D', text: 'Thanh toán thẻ' }
        ],
        correctAnswer: 'A',
        countdownSeconds: 5,
        revealDurationSeconds: 4,
        note: 'Make a reservation = Đặt phòng trước / Đặt bàn trước',
        explanation: 'Reservation = Việc đăng ký giữ chỗ trước tại khách sạn/nhà hàng',
        example: 'I have a reservation under the name of John Smith.',
        exampleMeaning: 'Tôi có một phòng đã đặt trước dưới tên John Smith.'
      }
    ]
  }
];
