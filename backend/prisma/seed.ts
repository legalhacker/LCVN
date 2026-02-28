import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.searchLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.mention.deleteMany();
  await prisma.annotation.deleteMany();
  await prisma.workspaceNote.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.articleResource.deleteMany();
  await prisma.articleVersion.deleteMany();
  await prisma.article.deleteMany();
  await prisma.documentRelation.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Cleaned existing data');

  // ============================================================================
  // USERS
  // ============================================================================
  const passwordHash = await bcrypt.hash('password123', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@lcvn.vn',
      passwordHash,
      fullName: 'Nguyễn Văn Admin',
      isActive: true,
      emailVerified: true,
      isAdmin: true,
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@company.vn',
      passwordHash,
      fullName: 'Trần Thị User',
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✓ Created users');

  // ============================================================================
  // WORKSPACE
  // ============================================================================
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Phòng Pháp chế ABC',
      slug: 'phong-phap-che-abc',
      description: 'Workspace cho phòng pháp chế công ty ABC',
      companyName: 'Công ty TNHH ABC',
      members: {
        create: [
          { userId: adminUser.id, role: 'WORKSPACE_ADMIN' },
          { userId: regularUser.id, role: 'MEMBER' },
        ],
      },
    },
  });

  console.log('✓ Created workspace');

  // ============================================================================
  // DOCUMENTS
  // ============================================================================

  // 1. Luật Đất đai 2024
  const luatDatDai = await prisma.document.create({
    data: {
      documentNumber: '31/2024/QH15',
      title: 'Luật Đất đai',
      titleSlug: 'luat-dat-dai-2024',
      documentType: 'LAW',
      issuingBody: 'Quốc hội',
      issuedDate: new Date('2024-01-18'),
      effectiveDate: new Date('2024-08-01'),
      status: 'EFFECTIVE',
      keywords: ['đất đai', 'quyền sử dụng đất', 'thu hồi đất', 'bồi thường', 'giải phóng mặt bằng'],
      summary: 'Luật này quy định về chế độ sở hữu đất đai, quyền và nghĩa vụ của người sử dụng đất, quản lý nhà nước về đất đai.',
      preamble: 'Căn cứ Hiến pháp nước Cộng hòa xã hội chủ nghĩa Việt Nam;\nQuốc hội ban hành Luật Đất đai.',
    },
  });

  // 2. Bộ luật Lao động 2019
  const boLuatLaoDong = await prisma.document.create({
    data: {
      documentNumber: '45/2019/QH14',
      title: 'Bộ luật Lao động',
      titleSlug: 'bo-luat-lao-dong-2019',
      documentType: 'CODE',
      issuingBody: 'Quốc hội',
      issuedDate: new Date('2019-11-20'),
      effectiveDate: new Date('2021-01-01'),
      status: 'EFFECTIVE',
      keywords: ['lao động', 'hợp đồng lao động', 'tiền lương', 'bảo hiểm xã hội', 'nghỉ phép'],
      summary: 'Bộ luật này quy định tiêu chuẩn lao động; quyền, nghĩa vụ của người lao động, người sử dụng lao động.',
    },
  });

  // 3. Luật Doanh nghiệp 2020
  const luatDoanhNghiep = await prisma.document.create({
    data: {
      documentNumber: '59/2020/QH14',
      title: 'Luật Doanh nghiệp',
      titleSlug: 'luat-doanh-nghiep-2020',
      documentType: 'LAW',
      issuingBody: 'Quốc hội',
      issuedDate: new Date('2020-06-17'),
      effectiveDate: new Date('2021-01-01'),
      status: 'EFFECTIVE',
      keywords: ['doanh nghiệp', 'công ty', 'cổ phần', 'TNHH', 'đăng ký kinh doanh'],
      summary: 'Luật này quy định về việc thành lập, tổ chức quản lý, tổ chức lại, giải thể và hoạt động có liên quan của doanh nghiệp.',
    },
  });

  // 4. Nghị định hướng dẫn Luật Đất đai
  const nghiDinhDatDai = await prisma.document.create({
    data: {
      documentNumber: '102/2024/NĐ-CP',
      title: 'Nghị định quy định chi tiết một số điều của Luật Đất đai',
      titleSlug: 'nghi-dinh-102-2024-huong-dan-luat-dat-dai',
      documentType: 'DECREE',
      issuingBody: 'Chính phủ',
      issuedDate: new Date('2024-07-15'),
      effectiveDate: new Date('2024-08-01'),
      status: 'EFFECTIVE',
      keywords: ['đất đai', 'hướng dẫn', 'thu hồi đất', 'bồi thường', 'tái định cư'],
      summary: 'Nghị định này quy định chi tiết một số điều của Luật Đất đai về thu hồi đất, bồi thường, hỗ trợ, tái định cư.',
    },
  });

  // 5. Thông tư hướng dẫn
  const thongTuDatDai = await prisma.document.create({
    data: {
      documentNumber: '08/2024/TT-BTNMT',
      title: 'Thông tư quy định chi tiết về hồ sơ địa chính',
      titleSlug: 'thong-tu-08-2024-tt-btnmt',
      documentType: 'CIRCULAR',
      issuingBody: 'Bộ Tài nguyên và Môi trường',
      issuedDate: new Date('2024-06-20'),
      effectiveDate: new Date('2024-08-01'),
      status: 'EFFECTIVE',
      keywords: ['hồ sơ địa chính', 'sổ đỏ', 'giấy chứng nhận', 'đăng ký đất đai'],
      summary: 'Thông tư này quy định chi tiết về lập, chỉnh lý, quản lý hồ sơ địa chính.',
    },
  });

  console.log('✓ Created documents');

  // ============================================================================
  // ARTICLES - Luật Đất đai
  // ============================================================================
  const datDaiArticles = [
    {
      articleNumber: 'Điều 1',
      title: 'Phạm vi điều chỉnh',
      chapterNumber: 'Chương I',
      chapterTitle: 'Những quy định chung',
      content: `Luật này quy định về chế độ sở hữu đất đai, quyền hạn và trách nhiệm của Nhà nước đại diện chủ sở hữu toàn dân về đất đai và thống nhất quản lý về đất đai, chế độ quản lý và sử dụng đất đai, quyền và nghĩa vụ của người sử dụng đất đối với đất đai thuộc lãnh thổ của nước Cộng hòa xã hội chủ nghĩa Việt Nam.`,
      keywords: ['phạm vi điều chỉnh', 'sở hữu đất đai', 'quản lý đất đai'],
      summary: 'Quy định phạm vi điều chỉnh của Luật Đất đai bao gồm chế độ sở hữu, quản lý và sử dụng đất đai.',
      hasPracticalReferences: true,
    },
    {
      articleNumber: 'Điều 2',
      title: 'Đối tượng áp dụng',
      chapterNumber: 'Chương I',
      chapterTitle: 'Những quy định chung',
      content: `Luật này áp dụng đối với cơ quan nhà nước thực hiện quyền hạn và trách nhiệm đại diện chủ sở hữu toàn dân về đất đai, thực hiện nhiệm vụ thống nhất quản lý nhà nước về đất đai; người sử dụng đất; tổ chức, cá nhân khác có liên quan đến việc quản lý, sử dụng đất.`,
      keywords: ['đối tượng áp dụng', 'cơ quan nhà nước', 'người sử dụng đất'],
      summary: 'Xác định các đối tượng áp dụng Luật Đất đai.',
      hasPracticalReferences: false,
    },
    {
      articleNumber: 'Điều 3',
      title: 'Giải thích từ ngữ',
      chapterNumber: 'Chương I',
      chapterTitle: 'Những quy định chung',
      content: `Trong Luật này, các từ ngữ dưới đây được hiểu như sau:

1. Đất đai là tài nguyên quốc gia vô cùng quý giá, là tư liệu sản xuất đặc biệt, là thành phần quan trọng hàng đầu của môi trường sống, là địa bàn phân bố các khu dân cư, xây dựng các cơ sở kinh tế, văn hóa, xã hội, an ninh và quốc phòng.

2. Thửa đất là phần diện tích đất được giới hạn bởi ranh giới xác định trên thực địa hoặc được mô tả trên hồ sơ.

3. Quyền sử dụng đất là quyền của người sử dụng đất được khai thác công dụng, hưởng hoa lợi, lợi tức từ việc sử dụng đất được Nhà nước giao, cho thuê, công nhận quyền sử dụng đất.

4. Giấy chứng nhận quyền sử dụng đất, quyền sở hữu nhà ở và tài sản khác gắn liền với đất là chứng thư pháp lý để Nhà nước xác nhận quyền sử dụng đất, quyền sở hữu nhà ở, tài sản khác gắn liền với đất hợp pháp của người có quyền sử dụng đất.

5. Thu hồi đất là việc Nhà nước quyết định thu lại quyền sử dụng đất của người được Nhà nước trao quyền sử dụng đất hoặc thu lại đất của người sử dụng đất vi phạm pháp luật về đất đai.`,
      keywords: ['giải thích từ ngữ', 'thửa đất', 'quyền sử dụng đất', 'giấy chứng nhận', 'thu hồi đất'],
      summary: 'Giải thích các thuật ngữ quan trọng trong Luật Đất đai.',
      hasPracticalReferences: true,
    },
    {
      articleNumber: 'Điều 4',
      title: 'Sở hữu đất đai',
      chapterNumber: 'Chương I',
      chapterTitle: 'Những quy định chung',
      content: `Đất đai thuộc sở hữu toàn dân do Nhà nước đại diện chủ sở hữu và thống nhất quản lý. Nhà nước trao quyền sử dụng đất cho người sử dụng đất theo quy định của Luật này.`,
      keywords: ['sở hữu đất đai', 'sở hữu toàn dân', 'nhà nước đại diện'],
      summary: 'Khẳng định chế độ sở hữu toàn dân về đất đai.',
      hasPracticalReferences: true,
    },
    {
      articleNumber: 'Điều 78',
      title: 'Thu hồi đất để phát triển kinh tế - xã hội vì lợi ích quốc gia, công cộng',
      chapterNumber: 'Chương VI',
      chapterTitle: 'Thu hồi đất, trưng dụng đất',
      content: `1. Nhà nước thu hồi đất để thực hiện các dự án sau đây:

a) Dự án xây dựng công trình quốc phòng, an ninh;
b) Dự án xây dựng trụ sở cơ quan nhà nước, công trình sự nghiệp công;
c) Dự án xây dựng kết cấu hạ tầng kỹ thuật, hạ tầng xã hội;
d) Dự án phát triển kinh tế - xã hội vì lợi ích quốc gia, công cộng.

2. Việc thu hồi đất theo quy định tại khoản 1 Điều này phải đảm bảo công khai, minh bạch, dân chủ và được sự đồng thuận của người có đất bị thu hồi.`,
      keywords: ['thu hồi đất', 'phát triển kinh tế', 'lợi ích công cộng', 'dự án'],
      summary: 'Quy định các trường hợp Nhà nước thu hồi đất để phát triển kinh tế - xã hội.',
      hasPracticalReferences: true,
    },
    {
      articleNumber: 'Điều 89',
      title: 'Nguyên tắc bồi thường về đất khi Nhà nước thu hồi đất',
      chapterNumber: 'Chương VII',
      chapterTitle: 'Bồi thường, hỗ trợ, tái định cư',
      content: `1. Người sử dụng đất khi bị Nhà nước thu hồi đất nếu có đủ điều kiện được bồi thường quy định tại Điều 90 của Luật này thì được bồi thường.

2. Việc bồi thường được thực hiện bằng việc giao đất có cùng mục đích sử dụng với loại đất thu hồi; nếu không có đất để bồi thường thì được bồi thường bằng tiền theo giá đất cụ thể của loại đất thu hồi do Ủy ban nhân dân cấp tỉnh quyết định tại thời điểm phê duyệt phương án bồi thường.

3. Giá đất để tính bồi thường phải bảo đảm người có đất bị thu hồi có điều kiện tìm kiếm địa điểm mới tương đương với địa điểm cũ.`,
      keywords: ['bồi thường', 'thu hồi đất', 'giá đất', 'nguyên tắc bồi thường'],
      summary: 'Nguyên tắc bồi thường về đất khi Nhà nước thu hồi đất.',
      hasPracticalReferences: true,
    },
  ];

  for (let i = 0; i < datDaiArticles.length; i++) {
    const art = datDaiArticles[i];
    await prisma.article.create({
      data: {
        documentId: luatDatDai.id,
        articleId: `luat-dat-dai-2024:${art.articleNumber.toLowerCase().replace(' ', '-')}`,
        articleNumber: art.articleNumber,
        title: art.title,
        chapterNumber: art.chapterNumber,
        chapterTitle: art.chapterTitle,
        content: art.content,
        contentHtml: `<div class="article-content">${art.content.replace(/\n/g, '<br/>')}</div>`,
        orderIndex: i + 1,
        keywords: art.keywords,
        summary: art.summary,
        hasPracticalReferences: art.hasPracticalReferences,
      },
    });
  }

  console.log('✓ Created Luật Đất đai articles');

  // ============================================================================
  // ARTICLES - Bộ luật Lao động
  // ============================================================================
  const laoDongArticles = [
    {
      articleNumber: 'Điều 1',
      title: 'Phạm vi điều chỉnh',
      chapterNumber: 'Chương I',
      chapterTitle: 'Những quy định chung',
      content: `Bộ luật này quy định tiêu chuẩn lao động; quyền, nghĩa vụ, trách nhiệm của người lao động, người sử dụng lao động, tổ chức đại diện người lao động tại cơ sở, tổ chức đại diện người sử dụng lao động trong quan hệ lao động và các quan hệ khác liên quan trực tiếp đến quan hệ lao động; quản lý nhà nước về lao động.`,
      keywords: ['phạm vi điều chỉnh', 'tiêu chuẩn lao động', 'quan hệ lao động'],
      summary: 'Quy định phạm vi điều chỉnh của Bộ luật Lao động.',
      hasPracticalReferences: false,
    },
    {
      articleNumber: 'Điều 13',
      title: 'Hợp đồng lao động',
      chapterNumber: 'Chương III',
      chapterTitle: 'Hợp đồng lao động',
      content: `1. Hợp đồng lao động là sự thỏa thuận giữa người lao động và người sử dụng lao động về việc làm có trả công, tiền lương, điều kiện lao động, quyền và nghĩa vụ của mỗi bên trong quan hệ lao động.

Trường hợp hai bên thỏa thuận bằng tên gọi khác nhưng có nội dung thể hiện về việc làm có trả công, tiền lương và sự quản lý, điều hành, giám sát của một bên thì được coi là hợp đồng lao động.

2. Trước khi nhận người lao động vào làm việc thì người sử dụng lao động phải giao kết hợp đồng lao động với người lao động.`,
      keywords: ['hợp đồng lao động', 'thỏa thuận', 'tiền lương', 'điều kiện lao động'],
      summary: 'Định nghĩa và yêu cầu về hợp đồng lao động.',
      hasPracticalReferences: true,
    },
    {
      articleNumber: 'Điều 20',
      title: 'Loại hợp đồng lao động',
      chapterNumber: 'Chương III',
      chapterTitle: 'Hợp đồng lao động',
      content: `1. Hợp đồng lao động phải được giao kết theo một trong các loại sau đây:

a) Hợp đồng lao động không xác định thời hạn là hợp đồng mà trong đó hai bên không xác định thời hạn, thời điểm chấm dứt hiệu lực của hợp đồng;

b) Hợp đồng lao động xác định thời hạn là hợp đồng mà trong đó hai bên xác định thời hạn, thời điểm chấm dứt hiệu lực của hợp đồng trong thời gian không quá 36 tháng kể từ ngày hợp đồng có hiệu lực.

2. Khi hợp đồng lao động quy định tại điểm b khoản 1 Điều này hết hạn mà người lao động vẫn tiếp tục làm việc thì trong thời hạn 30 ngày, kể từ ngày hợp đồng lao động hết hạn, hai bên phải ký kết hợp đồng lao động mới.`,
      keywords: ['loại hợp đồng', 'xác định thời hạn', 'không xác định thời hạn'],
      summary: 'Các loại hợp đồng lao động theo thời hạn.',
      hasPracticalReferences: true,
    },
    {
      articleNumber: 'Điều 34',
      title: 'Các trường hợp chấm dứt hợp đồng lao động',
      chapterNumber: 'Chương III',
      chapterTitle: 'Hợp đồng lao động',
      content: `1. Hết hạn hợp đồng lao động, trừ trường hợp quy định tại khoản 4 Điều 177 của Bộ luật này.

2. Đã hoàn thành công việc theo hợp đồng lao động.

3. Hai bên thỏa thuận chấm dứt hợp đồng lao động.

4. Người lao động bị kết án phạt tù nhưng không được hưởng án treo hoặc không thuộc trường hợp được trả tự do theo quy định tại khoản 5 Điều 328 của Bộ luật Tố tụng hình sự.

5. Người lao động là người nước ngoài làm việc tại Việt Nam bị trục xuất theo bản án, quyết định của Tòa án.

6. Người lao động chết; bị Tòa án tuyên bố mất năng lực hành vi dân sự, mất tích hoặc đã chết.

7. Người sử dụng lao động là cá nhân chết; bị Tòa án tuyên bố mất năng lực hành vi dân sự, mất tích hoặc đã chết.

8. Người lao động bị xử lý kỷ luật sa thải.

9. Người lao động đơn phương chấm dứt hợp đồng lao động theo quy định tại Điều 35 của Bộ luật này.

10. Người sử dụng lao động đơn phương chấm dứt hợp đồng lao động theo quy định tại Điều 36 của Bộ luật này.`,
      keywords: ['chấm dứt hợp đồng', 'hết hạn', 'sa thải', 'đơn phương chấm dứt'],
      summary: 'Liệt kê các trường hợp chấm dứt hợp đồng lao động.',
      hasPracticalReferences: true,
    },
  ];

  for (let i = 0; i < laoDongArticles.length; i++) {
    const art = laoDongArticles[i];
    await prisma.article.create({
      data: {
        documentId: boLuatLaoDong.id,
        articleId: `bo-luat-lao-dong-2019:${art.articleNumber.toLowerCase().replace(' ', '-')}`,
        articleNumber: art.articleNumber,
        title: art.title,
        chapterNumber: art.chapterNumber,
        chapterTitle: art.chapterTitle,
        content: art.content,
        contentHtml: `<div class="article-content">${art.content.replace(/\n/g, '<br/>')}</div>`,
        orderIndex: i + 1,
        keywords: art.keywords,
        summary: art.summary,
        hasPracticalReferences: art.hasPracticalReferences,
      },
    });
  }

  console.log('✓ Created Bộ luật Lao động articles');

  // ============================================================================
  // ARTICLES - Luật Doanh nghiệp
  // ============================================================================
  const doanhNghiepArticles = [
    {
      articleNumber: 'Điều 1',
      title: 'Phạm vi điều chỉnh',
      chapterNumber: 'Chương I',
      chapterTitle: 'Những quy định chung',
      content: `Luật này quy định về việc thành lập, tổ chức quản lý, tổ chức lại, giải thể và hoạt động có liên quan của doanh nghiệp, bao gồm công ty trách nhiệm hữu hạn, công ty cổ phần, công ty hợp danh và doanh nghiệp tư nhân; quy định về nhóm công ty và hộ kinh doanh.`,
      keywords: ['phạm vi điều chỉnh', 'doanh nghiệp', 'công ty'],
      summary: 'Quy định phạm vi điều chỉnh của Luật Doanh nghiệp.',
      hasPracticalReferences: false,
    },
    {
      articleNumber: 'Điều 46',
      title: 'Công ty trách nhiệm hữu hạn hai thành viên trở lên',
      chapterNumber: 'Chương III',
      chapterTitle: 'Công ty trách nhiệm hữu hạn',
      content: `1. Công ty trách nhiệm hữu hạn hai thành viên trở lên là doanh nghiệp có từ 02 đến 50 thành viên là tổ chức, cá nhân. Thành viên chịu trách nhiệm về các khoản nợ và nghĩa vụ tài sản khác của doanh nghiệp trong phạm vi số vốn đã góp vào doanh nghiệp.

2. Công ty trách nhiệm hữu hạn hai thành viên trở lên có tư cách pháp nhân kể từ ngày được cấp Giấy chứng nhận đăng ký doanh nghiệp.

3. Công ty trách nhiệm hữu hạn hai thành viên trở lên không được phát hành cổ phần, trừ trường hợp để chuyển đổi thành công ty cổ phần.`,
      keywords: ['công ty TNHH', 'thành viên', 'vốn góp', 'trách nhiệm hữu hạn'],
      summary: 'Quy định về công ty trách nhiệm hữu hạn hai thành viên trở lên.',
      hasPracticalReferences: true,
    },
  ];

  for (let i = 0; i < doanhNghiepArticles.length; i++) {
    const art = doanhNghiepArticles[i];
    await prisma.article.create({
      data: {
        documentId: luatDoanhNghiep.id,
        articleId: `luat-doanh-nghiep-2020:${art.articleNumber.toLowerCase().replace(' ', '-')}`,
        articleNumber: art.articleNumber,
        title: art.title,
        chapterNumber: art.chapterNumber,
        chapterTitle: art.chapterTitle,
        content: art.content,
        contentHtml: `<div class="article-content">${art.content.replace(/\n/g, '<br/>')}</div>`,
        orderIndex: i + 1,
        keywords: art.keywords,
        summary: art.summary,
        hasPracticalReferences: art.hasPracticalReferences,
      },
    });
  }

  console.log('✓ Created Luật Doanh nghiệp articles');

  // ============================================================================
  // DOCUMENT RELATIONS
  // ============================================================================
  await prisma.documentRelation.create({
    data: {
      fromDocumentId: nghiDinhDatDai.id,
      toDocumentId: luatDatDai.id,
      relationType: 'IMPLEMENTS',
      description: 'Nghị định hướng dẫn thi hành Luật Đất đai',
    },
  });

  await prisma.documentRelation.create({
    data: {
      fromDocumentId: thongTuDatDai.id,
      toDocumentId: luatDatDai.id,
      relationType: 'IMPLEMENTS',
      description: 'Thông tư hướng dẫn về hồ sơ địa chính',
    },
  });

  console.log('✓ Created document relations');

  // ============================================================================
  // ARTICLE RESOURCES (Practical References)
  // ============================================================================
  const article1 = await prisma.article.findFirst({
    where: { articleId: 'luat-dat-dai-2024:điều-78' },
  });

  const article2 = await prisma.article.findFirst({
    where: { articleId: 'luat-dat-dai-2024:điều-89' },
  });

  const article3 = await prisma.article.findFirst({
    where: { articleId: 'bo-luat-lao-dong-2019:điều-34' },
  });

  if (article1) {
    await prisma.articleResource.createMany({
      data: [
        {
          articleId: article1.id,
          resourceType: 'COURT_CASE',
          title: 'Bản án số 156/2023/DS-PT về tranh chấp thu hồi đất',
          source: 'TAND TP. Hồ Chí Minh',
          courtName: 'Tòa án nhân dân TP. Hồ Chí Minh',
          caseNumber: '156/2023/DS-PT',
          judgmentDate: new Date('2023-08-15'),
          excerpt: 'Vụ án tranh chấp về quyền sử dụng đất khi bị thu hồi để thực hiện dự án xây dựng khu đô thị mới...',
          externalUrl: 'https://congbobanan.toaan.gov.vn/2ta123',
        },
        {
          articleId: article1.id,
          resourceType: 'ADMIN_PENALTY',
          title: 'Quyết định xử phạt vi phạm hành chính về đất đai',
          source: 'UBND Quận Bình Thạnh',
          publishedDate: new Date('2023-05-20'),
          excerpt: 'Xử phạt về hành vi vi phạm quy định sử dụng đất sai mục đích...',
        },
        {
          articleId: article1.id,
          resourceType: 'EXPERT_ARTICLE',
          title: 'Phân tích quy định mới về thu hồi đất theo Luật Đất đai 2024',
          author: 'TS. Nguyễn Văn Minh',
          source: 'Tạp chí Luật học',
          publishedDate: new Date('2024-03-01'),
          excerpt: 'Bài viết phân tích những điểm mới trong quy định về thu hồi đất...',
          externalUrl: 'https://tapchiluathoc.vn/article/123',
        },
      ],
    });
  }

  if (article2) {
    await prisma.articleResource.createMany({
      data: [
        {
          articleId: article2.id,
          resourceType: 'COURT_CASE',
          title: 'Án lệ số 45/2023/AL về bồi thường thu hồi đất',
          source: 'Tòa án nhân dân tối cao',
          courtName: 'Tòa án nhân dân tối cao',
          caseNumber: '45/2023/AL',
          judgmentDate: new Date('2023-10-10'),
          excerpt: 'Án lệ về nguyên tắc xác định giá đất bồi thường khi thu hồi đất...',
          externalUrl: 'https://anle.toaan.gov.vn/45-2023',
        },
        {
          articleId: article2.id,
          resourceType: 'LAW_FIRM_PUBLICATION',
          title: 'Hướng dẫn thực tiễn về bồi thường khi bị thu hồi đất',
          author: 'Công ty Luật TNHH ABC',
          source: 'ABC Legal Newsletter',
          publishedDate: new Date('2024-02-15'),
          excerpt: 'Hướng dẫn chi tiết về quyền lợi và thủ tục bồi thường khi bị thu hồi đất...',
        },
      ],
    });
  }

  if (article3) {
    await prisma.articleResource.createMany({
      data: [
        {
          articleId: article3.id,
          resourceType: 'COURT_CASE',
          title: 'Bản án số 89/2022/LĐ-PT về tranh chấp chấm dứt HĐLĐ',
          source: 'TAND TP. Hà Nội',
          courtName: 'Tòa án nhân dân TP. Hà Nội',
          caseNumber: '89/2022/LĐ-PT',
          judgmentDate: new Date('2022-11-20'),
          excerpt: 'Tranh chấp về việc đơn phương chấm dứt hợp đồng lao động trái pháp luật...',
          externalUrl: 'https://congbobanan.toaan.gov.vn/ld89',
        },
        {
          articleId: article3.id,
          resourceType: 'EXPERT_ARTICLE',
          title: 'Quyền đơn phương chấm dứt HĐLĐ của người sử dụng lao động',
          author: 'ThS. Trần Thị Hoa',
          source: 'Tạp chí Lao động và Xã hội',
          publishedDate: new Date('2023-06-10'),
          excerpt: 'Bài viết phân tích các trường hợp người sử dụng lao động được quyền đơn phương chấm dứt HĐLĐ...',
        },
      ],
    });
  }

  console.log('✓ Created article resources (practical references)');

  // ============================================================================
  // SAMPLE ANNOTATIONS
  // ============================================================================
  const articleForAnnotation = await prisma.article.findFirst({
    where: { articleId: 'luat-dat-dai-2024:điều-3' },
  });

  if (articleForAnnotation) {
    await prisma.annotation.create({
      data: {
        articleId: articleForAnnotation.id,
        userId: regularUser.id,
        workspaceId: workspace.id,
        startOffset: 0,
        endOffset: 50,
        selectedText: 'Đất đai là tài nguyên quốc gia vô cùng quý giá',
        annotationType: 'note',
        highlightColor: 'yellow',
        noteContent: 'Đây là định nghĩa cơ bản cần lưu ý khi tư vấn cho khách hàng về giá trị đất đai.',
        visibility: 'WORKSPACE',
      },
    });

    await prisma.annotation.create({
      data: {
        articleId: articleForAnnotation.id,
        userId: adminUser.id,
        startOffset: 200,
        endOffset: 280,
        selectedText: 'Quyền sử dụng đất là quyền của người sử dụng đất',
        annotationType: 'highlight',
        highlightColor: 'green',
        visibility: 'PRIVATE',
      },
    });
  }

  console.log('✓ Created sample annotations');

  // ============================================================================
  // WORKSPACE NOTES
  // ============================================================================
  if (articleForAnnotation) {
    await prisma.workspaceNote.create({
      data: {
        workspaceId: workspace.id,
        articleId: articleForAnnotation.articleId,
        title: 'Lưu ý áp dụng cho dự án Khu đô thị ABC',
        content: `## Điểm cần lưu ý

1. Khi tư vấn cho khách hàng về dự án Khu đô thị ABC, cần nhấn mạnh định nghĩa "quyền sử dụng đất" theo Điều 3.

2. Đặc biệt chú ý khoản 3 về quyền khai thác, hưởng hoa lợi.

## Tài liệu liên quan
- Hợp đồng mẫu đã soạn
- Ý kiến pháp lý số 45/2024`,
        createdById: adminUser.id,
      },
    });
  }

  console.log('✓ Created workspace notes');

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================
  await prisma.notification.create({
    data: {
      userId: regularUser.id,
      type: 'WORKSPACE_INVITE',
      title: 'Bạn được mời vào workspace',
      message: 'Bạn đã được thêm vào workspace "Phòng Pháp chế ABC"',
      linkType: 'workspace',
      linkId: workspace.id,
      isRead: false,
    },
  });

  console.log('✓ Created notifications');

  console.log('\n✅ Database seeding completed!');
  console.log('\n📊 Summary:');
  console.log('   - 2 users (admin@vietlaw.vn, user@company.vn)');
  console.log('   - 1 workspace');
  console.log('   - 5 documents (3 laws, 1 decree, 1 circular)');
  console.log('   - 12 articles with full content');
  console.log('   - 7 practical references (court cases, expert articles)');
  console.log('   - 2 sample annotations');
  console.log('   - 1 workspace note');
  console.log('\n🔑 Test credentials:');
  console.log('   Email: admin@vietlaw.vn');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
