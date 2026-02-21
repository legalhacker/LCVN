import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.homepageHeadline.deleteMany();
  await prisma.regulatoryChangeField.deleteMany();
  await prisma.regulatoryChange.deleteMany();
  await prisma.field.deleteMany();
  await prisma.user.deleteMany();

  // ================================================================
  // ADMIN USER
  // ================================================================
  const passwordHash = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@lcvn.vn",
      passwordHash,
      name: "Admin",
      role: "admin",
    },
  });
  console.log("Admin user created: admin@lcvn.vn / admin123");

  // ================================================================
  // FIELDS
  // ================================================================
  const fieldData = [
    { name: "Đầu tư", slug: "dau-tu" },
    { name: "Doanh nghiệp", slug: "doanh-nghiep" },
    { name: "Trí tuệ nhân tạo", slug: "tri-tue-nhan-tao" },
    { name: "Bảo vệ dữ liệu", slug: "bao-ve-du-lieu" },
    { name: "Lao động", slug: "lao-dong" },
    { name: "Tài chính – ngân hàng", slug: "tai-chinh-ngan-hang" },
    { name: "Sở hữu trí tuệ", slug: "so-huu-tri-tue" },
    { name: "Bản quyền", slug: "ban-quyen" },
  ];

  const fields: Record<string, string> = {};
  for (const f of fieldData) {
    const field = await prisma.field.create({ data: f });
    fields[f.name] = field.id;
  }
  console.log(`Fields created: ${fieldData.length}`);

  // ================================================================
  // REGULATORY CHANGES
  // ================================================================
  const change1 = await prisma.regulatoryChange.create({
    data: {
      slug: "shtt-ai-ownership",
      lawName: "Luật Sở hữu trí tuệ sửa đổi 2025",
      changeType: "addition",
      legalBasis: "Khoản 5 Điều 6 (bổ sung)",
      source: "Luật Sở hữu trí tuệ sửa đổi 2025 – số 131/2025/QH15",
      effectiveDate: new Date("2026-01-01"),
      headline: "[Luật SHTT] Lần đầu luật hóa quyền SHTT với sản phẩm do AI tạo ra → ảnh hưởng trực tiếp tới doanh nghiệp công nghệ & startup AI",
      summary: "Trước đây, pháp luật SHTT không thừa nhận quyền sở hữu trí tuệ đối với sản phẩm được tạo ra bởi AI. Nay Luật SHTT sửa đổi 2025 chính thức cho phép xác lập quyền, đồng thời giao Chính phủ quy định chi tiết về chủ thể quyền khi có AI tham gia.",
      practicalImpact: [
        "Doanh nghiệp công nghệ và startup AI có thể đăng ký bảo hộ quyền SHTT cho sản phẩm do AI tạo ra, tăng giá trị tài sản trí tuệ.",
        "Chính phủ được giao quy định chi tiết về phát sinh quyền, xác lập quyền và xác định chủ thể quyền — nghĩa là còn cần Nghị định hướng dẫn trước khi áp dụng thực tế.",
        "Nhà đầu tư nước ngoài trong lĩnh vực AI có thêm cơ sở pháp lý để triển khai hoạt động R&D tại Việt Nam.",
        "Tranh chấp về quyền sở hữu giữa người phát triển AI và người sử dụng AI sẽ có khung pháp lý để giải quyết.",
      ],
      affectedParties: [
        "Doanh nghiệp công nghệ & startup AI",
        "Nhà đầu tư lĩnh vực AI/ML",
        "Cơ quan quản lý SHTT (Cục SHTT)",
        "Luật sư / tư vấn SHTT",
      ],
      analysisSummary: "Luật SHTT sửa đổi 2025 lần đầu tiên công nhận khả năng xác lập quyền sở hữu trí tuệ đối với các đối tượng được tạo ra có sử dụng hệ thống trí tuệ nhân tạo (AI). Đây là bước ngoặt lớn trong khung pháp lý về SHTT tại Việt Nam, đặt nền tảng cho việc bảo hộ sáng chế, kiểu dáng công nghiệp và các sản phẩm sáng tạo được tạo ra với sự hỗ trợ của AI.",
      comparisonBefore: "Pháp luật SHTT không có quy định nào về quyền sở hữu trí tuệ đối với sản phẩm được tạo ra bởi AI hoặc có sự tham gia của AI. Các sản phẩm do AI tạo ra nằm ngoài phạm vi bảo hộ.",
      comparisonAfter: "Luật chính thức thừa nhận khả năng xác lập quyền SHTT đối với đối tượng được tạo ra có sử dụng hệ thống AI. Chính phủ sẽ ban hành Nghị định hướng dẫn chi tiết về điều kiện phát sinh quyền, thủ tục xác lập và xác định chủ thể quyền.",
      timeline: "Luật được Quốc hội thông qua năm 2025. Hiệu lực dự kiến từ 01/01/2026. Nghị định hướng dẫn chi tiết chưa được ban hành.",
      context: "Việt Nam là một trong những quốc gia đầu tiên trong ASEAN có quy định pháp luật rõ ràng về SHTT gắn với AI, theo xu hướng của EU AI Act và các khung pháp lý quốc tế đang hình thành.",
      status: "published",
    },
  });

  await prisma.regulatoryChangeField.createMany({
    data: [
      { regulatoryChangeId: change1.id, fieldId: fields["Trí tuệ nhân tạo"] },
      { regulatoryChangeId: change1.id, fieldId: fields["Sở hữu trí tuệ"] },
      { regulatoryChangeId: change1.id, fieldId: fields["Doanh nghiệp"] },
    ],
  });

  const change2 = await prisma.regulatoryChange.create({
    data: {
      slug: "shtt-ai-training-data",
      lawName: "Luật Sở hữu trí tuệ sửa đổi 2025",
      changeType: "addition",
      legalBasis: "Khoản 5 Điều 7 (mới)",
      source: "Luật Sở hữu trí tuệ sửa đổi 2025 – số 131/2025/QH15",
      effectiveDate: new Date("2026-01-01"),
      headline: "[Luật SHTT] Cho phép dùng dữ liệu đã công bố để huấn luyện AI → doanh nghiệp AI có cơ sở pháp lý rõ ràng để thu thập dữ liệu",
      summary: "Trước đây, việc sử dụng tác phẩm/dữ liệu có bản quyền để huấn luyện AI nằm trong vùng xám pháp lý. Nay luật cho phép rõ ràng, với điều kiện không ảnh hưởng bất hợp lý đến quyền của chủ sở hữu.",
      practicalImpact: [
        "Doanh nghiệp AI có cơ sở pháp lý rõ ràng để thu thập và sử dụng dữ liệu công khai cho mục đích huấn luyện mô hình, giảm rủi ro pháp lý.",
        "Chủ sở hữu quyền SHTT vẫn được bảo vệ — luật đặt giới hạn 'không ảnh hưởng bất hợp lý' đến quyền khai thác thương mại.",
        "Các tổ chức nghiên cứu, trường đại học có thêm không gian pháp lý cho hoạt động R&D liên quan đến AI.",
        "Cần chờ Nghị định hướng dẫn để xác định rõ thế nào là 'ảnh hưởng bất hợp lý' trong thực tế.",
      ],
      affectedParties: [
        "Doanh nghiệp AI / ML / Data",
        "Chủ sở hữu bản quyền & dữ liệu",
        "Tổ chức nghiên cứu & đại học",
        "Nền tảng nội dung số",
      ],
      analysisSummary: "Lần đầu tiên pháp luật Việt Nam cho phép sử dụng hợp pháp văn bản và dữ liệu về đối tượng quyền sở hữu trí tuệ đã được công bố công khai để nghiên cứu, thử nghiệm và huấn luyện hệ thống trí tuệ nhân tạo. Quy định đặt ra điều kiện: việc sử dụng không được ảnh hưởng bất hợp lý đến việc khai thác bình thường quyền của chủ sở hữu.",
      comparisonBefore: "Việc sử dụng tác phẩm, dữ liệu có bản quyền để huấn luyện AI nằm trong vùng xám pháp lý. Không có quy định cụ thể cho phép hay cấm, gây rủi ro cho doanh nghiệp AI.",
      comparisonAfter: "Luật cho phép rõ ràng việc sử dụng dữ liệu đã công bố để huấn luyện AI, với điều kiện không ảnh hưởng bất hợp lý đến quyền của chủ sở hữu. Đây là ngoại lệ bản quyền (copyright exception) dành riêng cho AI.",
      timeline: "Luật được Quốc hội thông qua năm 2025. Hiệu lực dự kiến từ 01/01/2026. Ranh giới 'bất hợp lý' sẽ được làm rõ trong Nghị định hướng dẫn.",
      context: "Quy định tương tự 'text and data mining exception' trong EU Copyright Directive (Art. 3–4), nhưng phạm vi áp dụng hẹp hơn — chỉ giới hạn cho dữ liệu đã được công bố công khai.",
      status: "published",
    },
  });

  await prisma.regulatoryChangeField.createMany({
    data: [
      { regulatoryChangeId: change2.id, fieldId: fields["Trí tuệ nhân tạo"] },
      { regulatoryChangeId: change2.id, fieldId: fields["Bảo vệ dữ liệu"] },
      { regulatoryChangeId: change2.id, fieldId: fields["Bản quyền"] },
    ],
  });

  console.log("Regulatory changes created: 2");

  // ================================================================
  // HOMEPAGE HEADLINES
  // ================================================================
  await prisma.homepageHeadline.create({
    data: {
      regulatoryChangeId: change1.id,
      title: "[Luật SHTT] Lần đầu luật hóa quyền SHTT với sản phẩm do AI tạo ra → ảnh hưởng trực tiếp tới doanh nghiệp công nghệ & startup AI",
      subtitle: "Luật SHTT sửa đổi 2025 chính thức cho phép xác lập quyền SHTT cho sản phẩm do AI tạo ra.",
      position: 1,
      pinned: false,
      status: "active",
      createdById: adminUser.id,
    },
  });

  await prisma.homepageHeadline.create({
    data: {
      regulatoryChangeId: change2.id,
      title: "[Luật SHTT] Cho phép dùng dữ liệu đã công bố để huấn luyện AI → doanh nghiệp AI có cơ sở pháp lý rõ ràng",
      subtitle: "Ngoại lệ bản quyền dành riêng cho AI: cho phép sử dụng dữ liệu công khai để huấn luyện mô hình.",
      position: 2,
      pinned: false,
      status: "active",
      createdById: adminUser.id,
    },
  });

  console.log("Homepage headlines created: 2");

  // Count results
  const userCount = await prisma.user.count();
  const fieldCount = await prisma.field.count();
  const changeCount = await prisma.regulatoryChange.count();
  const headlineCount = await prisma.homepageHeadline.count();

  console.log("Seed completed successfully!");
  console.log(`Users: ${userCount}`);
  console.log(`Fields: ${fieldCount}`);
  console.log(`Regulatory Changes: ${changeCount}`);
  console.log(`Headlines: ${headlineCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
