import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.legalMetadata.deleteMany();
  await prisma.legalRelationship.deleteMany();
  await prisma.point.deleteMany();
  await prisma.clause.deleteMany();
  await prisma.article.deleteMany();
  await prisma.legalDocument.deleteMany();

  // Create Bộ luật Lao động 2019
  const doc = await prisma.legalDocument.create({
    data: {
      canonicalId: "VN_LLD_2019",
      title: "Bộ luật Lao động",
      documentNumber: "45/2019/QH14",
      documentType: "luat",
      issuingBody: "Quốc hội",
      issuedDate: new Date("2019-11-20"),
      effectiveDate: new Date("2021-01-01"),
      slug: "bo-luat-lao-dong",
      year: 2019,
      status: "active",
    },
  });

  // --- Điều 34: Các trường hợp chấm dứt hợp đồng lao động ---
  const article34 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D34",
      documentId: doc.id,
      articleNumber: 34,
      title: "Các trường hợp chấm dứt hợp đồng lao động",
      content:
        "Hợp đồng lao động chấm dứt trong trường hợp sau đây:",
      chapter: "Chương III",
      section: "Mục 4",
    },
  });

  const clause34_1 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D34_K1",
      articleId: article34.id,
      clauseNumber: 1,
      content: "Hết hạn hợp đồng lao động, trừ trường hợp quy định tại khoản 4 Điều 177 của Bộ luật này.",
    },
  });

  const clause34_2 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D34_K2",
      articleId: article34.id,
      clauseNumber: 2,
      content: "Đã hoàn thành công việc theo hợp đồng lao động.",
    },
  });

  const clause34_3 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D34_K3",
      articleId: article34.id,
      clauseNumber: 3,
      content: "Hai bên thỏa thuận chấm dứt hợp đồng lao động.",
    },
  });

  const clause34_4 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D34_K4",
      articleId: article34.id,
      clauseNumber: 4,
      content:
        "Người lao động bị kết án phạt tù nhưng không được hưởng án treo hoặc không thuộc trường hợp được trả tự do theo quy định tại khoản 5 Điều 328 của Bộ luật Tố tụng hình sự, tử hình hoặc bị cấm làm công việc ghi trong hợp đồng lao động theo bản án, quyết định của Tòa án đã có hiệu lực pháp luật.",
    },
  });

  const clause34_5 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D34_K5",
      articleId: article34.id,
      clauseNumber: 5,
      content:
        "Người lao động là người nước ngoài làm việc tại Việt Nam bị trục xuất theo bản án, quyết định của Tòa án đã có hiệu lực pháp luật, quyết định của cơ quan nhà nước có thẩm quyền.",
    },
  });

  const clause34_6 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D34_K6",
      articleId: article34.id,
      clauseNumber: 6,
      content: "Người lao động chết; bị Tòa án tuyên bố mất năng lực hành vi dân sự, mất tích hoặc đã chết.",
    },
  });

  const clause34_7 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D34_K7",
      articleId: article34.id,
      clauseNumber: 7,
      content:
        "Người sử dụng lao động là cá nhân chết; bị Tòa án tuyên bố mất năng lực hành vi dân sự, mất tích hoặc đã chết. Người sử dụng lao động không phải là cá nhân chấm dứt hoạt động hoặc bị cơ quan chuyên môn về đăng ký kinh doanh thuộc Ủy ban nhân dân cấp tỉnh ra thông báo không có người đại diện theo pháp luật, người được ủy quyền thực hiện quyền và nghĩa vụ của người đại diện theo pháp luật.",
    },
  });

  const clause34_8 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D34_K8",
      articleId: article34.id,
      clauseNumber: 8,
      content:
        "Người lao động bị xử lý kỷ luật sa thải.",
    },
  });

  const clause34_9 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D34_K9",
      articleId: article34.id,
      clauseNumber: 9,
      content:
        "Người lao động đơn phương chấm dứt hợp đồng lao động theo quy định tại Điều 35 của Bộ luật này.",
    },
  });

  const clause34_10 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D34_K10",
      articleId: article34.id,
      clauseNumber: 10,
      content:
        "Người sử dụng lao động đơn phương chấm dứt hợp đồng lao động theo quy định tại Điều 36 của Bộ luật này.",
    },
  });

  const clause34_11 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D34_K11",
      articleId: article34.id,
      clauseNumber: 11,
      content:
        "Người sử dụng lao động cho người lao động thôi việc theo quy định tại Điều 42 và Điều 43 của Bộ luật này.",
    },
  });

  const clause34_12 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D34_K12",
      articleId: article34.id,
      clauseNumber: 12,
      content: "Giấy phép lao động hết hiệu lực đối với người lao động là người nước ngoài làm việc tại Việt Nam theo quy định tại Điều 156 của Bộ luật này.",
    },
  });

  const clause34_13 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D34_K13",
      articleId: article34.id,
      clauseNumber: 13,
      content:
        "Trường hợp thỏa thuận nội dung thử việc ghi trong hợp đồng lao động mà thử việc không đạt yêu cầu hoặc một bên hủy bỏ thỏa thuận thử việc.",
    },
  });

  // --- Điều 35: Quyền đơn phương chấm dứt HĐLĐ của NLĐ ---
  const article35 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D35",
      documentId: doc.id,
      articleNumber: 35,
      title: "Quyền đơn phương chấm dứt hợp đồng lao động của người lao động",
      content:
        "Người lao động có quyền đơn phương chấm dứt hợp đồng lao động nhưng phải báo trước cho người sử dụng lao động theo quy định sau đây:",
      chapter: "Chương III",
      section: "Mục 4",
    },
  });

  const clause35_1 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D35_K1",
      articleId: article35.id,
      clauseNumber: 1,
      content:
        "Người lao động có quyền đơn phương chấm dứt hợp đồng lao động nhưng phải báo trước cho người sử dụng lao động như sau:",
    },
  });

  await prisma.point.createMany({
    data: [
      {
        canonicalId: "VN_LLD_2019_D35_K1_A",
        clauseId: clause35_1.id,
        pointLetter: "a",
        content:
          "Ít nhất 45 ngày nếu làm việc theo hợp đồng lao động không xác định thời hạn;",
      },
      {
        canonicalId: "VN_LLD_2019_D35_K1_B",
        clauseId: clause35_1.id,
        pointLetter: "b",
        content:
          "Ít nhất 30 ngày nếu làm việc theo hợp đồng lao động xác định thời hạn có thời hạn từ 12 tháng đến 36 tháng;",
      },
      {
        canonicalId: "VN_LLD_2019_D35_K1_C",
        clauseId: clause35_1.id,
        pointLetter: "c",
        content:
          "Ít nhất 03 ngày làm việc nếu làm việc theo hợp đồng lao động xác định thời hạn có thời hạn dưới 12 tháng;",
      },
      {
        canonicalId: "VN_LLD_2019_D35_K1_D",
        clauseId: clause35_1.id,
        pointLetter: "d",
        content:
          "Đối với một số ngành, nghề, công việc đặc thù thì thời hạn báo trước theo quy định của Chính phủ.",
      },
    ],
  });

  const clause35_2 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D35_K2",
      articleId: article35.id,
      clauseNumber: 2,
      content:
        "Người lao động có quyền đơn phương chấm dứt hợp đồng lao động không cần báo trước trong trường hợp sau đây:",
    },
  });

  await prisma.point.createMany({
    data: [
      {
        canonicalId: "VN_LLD_2019_D35_K2_A",
        clauseId: clause35_2.id,
        pointLetter: "a",
        content:
          "Không được bố trí theo đúng công việc, địa điểm làm việc hoặc không được bảo đảm điều kiện làm việc theo thỏa thuận, trừ trường hợp quy định tại Điều 29 của Bộ luật này;",
      },
      {
        canonicalId: "VN_LLD_2019_D35_K2_B",
        clauseId: clause35_2.id,
        pointLetter: "b",
        content:
          "Không được trả đủ lương hoặc trả lương không đúng thời hạn, trừ trường hợp quy định tại khoản 4 Điều 97 của Bộ luật này;",
      },
      {
        canonicalId: "VN_LLD_2019_D35_K2_C",
        clauseId: clause35_2.id,
        pointLetter: "c",
        content:
          "Bị người sử dụng lao động ngược đãi, đánh đập hoặc có lời nói, hành vi nhục mạ, hành vi làm ảnh hưởng đến sức khỏe, nhân phẩm, danh dự; bị cưỡng bức lao động;",
      },
      {
        canonicalId: "VN_LLD_2019_D35_K2_D",
        clauseId: clause35_2.id,
        pointLetter: "d",
        content:
          "Bị quấy rối tình dục tại nơi làm việc;",
      },
      {
        canonicalId: "VN_LLD_2019_D35_K2_DD",
        clauseId: clause35_2.id,
        pointLetter: "e",
        content:
          "Lao động nữ mang thai phải nghỉ việc theo quy định tại khoản 1 Điều 138 của Bộ luật này;",
      },
      {
        canonicalId: "VN_LLD_2019_D35_K2_E",
        clauseId: clause35_2.id,
        pointLetter: "f",
        content:
          "Đủ tuổi nghỉ hưu theo quy định tại Điều 169 của Bộ luật này, trừ trường hợp các bên có thỏa thuận khác;",
      },
      {
        canonicalId: "VN_LLD_2019_D35_K2_G",
        clauseId: clause35_2.id,
        pointLetter: "g",
        content:
          "Người sử dụng lao động cung cấp thông tin không trung thực theo quy định tại khoản 1 Điều 16 của Bộ luật này làm ảnh hưởng đến việc thực hiện hợp đồng lao động.",
      },
    ],
  });

  // --- Điều 36: Quyền đơn phương chấm dứt HĐLĐ của NSDLĐ ---
  const article36 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D36",
      documentId: doc.id,
      articleNumber: 36,
      title: "Quyền đơn phương chấm dứt hợp đồng lao động của người sử dụng lao động",
      content:
        "Người sử dụng lao động có quyền đơn phương chấm dứt hợp đồng lao động trong trường hợp sau đây:",
      chapter: "Chương III",
      section: "Mục 4",
    },
  });

  const clause36_1 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D36_K1",
      articleId: article36.id,
      clauseNumber: 1,
      content:
        "Người sử dụng lao động có quyền đơn phương chấm dứt hợp đồng lao động trong trường hợp sau đây:",
    },
  });

  await prisma.point.createMany({
    data: [
      {
        canonicalId: "VN_LLD_2019_D36_K1_A",
        clauseId: clause36_1.id,
        pointLetter: "a",
        content:
          "Người lao động thường xuyên không hoàn thành công việc theo hợp đồng lao động được xác định theo tiêu chí đánh giá mức độ hoàn thành công việc trong quy chế của người sử dụng lao động. Quy chế đánh giá mức độ hoàn thành công việc do người sử dụng lao động ban hành nhưng phải tham khảo ý kiến tổ chức đại diện người lao động tại cơ sở đối với nơi có tổ chức đại diện người lao động tại cơ sở;",
      },
      {
        canonicalId: "VN_LLD_2019_D36_K1_B",
        clauseId: clause36_1.id,
        pointLetter: "b",
        content:
          "Người lao động bị ốm đau, tai nạn đã điều trị 12 tháng liên tục đối với người làm việc theo hợp đồng lao động không xác định thời hạn hoặc đã điều trị 06 tháng liên tục đối với người làm việc theo hợp đồng lao động xác định thời hạn có thời hạn từ 12 tháng đến 36 tháng hoặc quá nửa thời hạn hợp đồng lao động đối với người làm việc theo hợp đồng lao động xác định thời hạn có thời hạn dưới 12 tháng mà khả năng lao động chưa hồi phục;",
      },
      {
        canonicalId: "VN_LLD_2019_D36_K1_C",
        clauseId: clause36_1.id,
        pointLetter: "c",
        content:
          "Do thiên tai, hỏa hoạn, dịch bệnh nguy hiểm, địch họa hoặc di dời, thu hẹp sản xuất, kinh doanh theo yêu cầu của cơ quan nhà nước có thẩm quyền mà người sử dụng lao động đã tìm mọi biện pháp khắc phục nhưng vẫn buộc phải giảm chỗ làm việc;",
      },
      {
        canonicalId: "VN_LLD_2019_D36_K1_D",
        clauseId: clause36_1.id,
        pointLetter: "d",
        content:
          "Người lao động không có mặt tại nơi làm việc sau thời hạn quy định tại Điều 31 của Bộ luật này;",
      },
      {
        canonicalId: "VN_LLD_2019_D36_K1_DD",
        clauseId: clause36_1.id,
        pointLetter: "e",
        content:
          "Người lao động đủ tuổi nghỉ hưu theo quy định tại Điều 169 của Bộ luật này, trừ trường hợp có thỏa thuận khác;",
      },
      {
        canonicalId: "VN_LLD_2019_D36_K1_E",
        clauseId: clause36_1.id,
        pointLetter: "f",
        content:
          "Người lao động tự ý bỏ việc mà không có lý do chính đáng từ 05 ngày làm việc liên tục trở lên;",
      },
      {
        canonicalId: "VN_LLD_2019_D36_K1_G",
        clauseId: clause36_1.id,
        pointLetter: "g",
        content:
          "Người lao động cung cấp không trung thực thông tin theo quy định tại khoản 2 Điều 16 của Bộ luật này khi giao kết hợp đồng lao động làm ảnh hưởng đến việc tuyển dụng người lao động.",
      },
    ],
  });

  const clause36_2 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D36_K2",
      articleId: article36.id,
      clauseNumber: 2,
      content:
        "Khi đơn phương chấm dứt hợp đồng lao động, người sử dụng lao động phải báo trước cho người lao động như sau:",
    },
  });

  await prisma.point.createMany({
    data: [
      {
        canonicalId: "VN_LLD_2019_D36_K2_A",
        clauseId: clause36_2.id,
        pointLetter: "a",
        content:
          "Ít nhất 45 ngày đối với hợp đồng lao động không xác định thời hạn;",
      },
      {
        canonicalId: "VN_LLD_2019_D36_K2_B",
        clauseId: clause36_2.id,
        pointLetter: "b",
        content:
          "Ít nhất 30 ngày đối với hợp đồng lao động xác định thời hạn có thời hạn từ 12 tháng đến 36 tháng;",
      },
      {
        canonicalId: "VN_LLD_2019_D36_K2_C",
        clauseId: clause36_2.id,
        pointLetter: "c",
        content:
          "Ít nhất 03 ngày làm việc đối với hợp đồng lao động xác định thời hạn có thời hạn dưới 12 tháng và đối với trường hợp quy định tại điểm b khoản 1 Điều này;",
      },
      {
        canonicalId: "VN_LLD_2019_D36_K2_D",
        clauseId: clause36_2.id,
        pointLetter: "d",
        content:
          "Đối với một số ngành, nghề, công việc đặc thù thì thời hạn báo trước theo quy định của Chính phủ.",
      },
    ],
  });

  const clause36_3 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D36_K3",
      articleId: article36.id,
      clauseNumber: 3,
      content:
        "Người sử dụng lao động không được thực hiện quyền đơn phương chấm dứt hợp đồng lao động đối với trường hợp quy định tại Điều 37 của Bộ luật này.",
    },
  });

  // --- Điều 37: Trường hợp NSDLĐ không được đơn phương chấm dứt HĐLĐ ---
  const article37 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D37",
      documentId: doc.id,
      articleNumber: 37,
      title: "Trường hợp người sử dụng lao động không được thực hiện quyền đơn phương chấm dứt hợp đồng lao động",
      content:
        "Người sử dụng lao động không được thực hiện quyền đơn phương chấm dứt hợp đồng lao động trong trường hợp sau đây:",
      chapter: "Chương III",
      section: "Mục 4",
    },
  });

  await prisma.clause.createMany({
    data: [
      {
        canonicalId: "VN_LLD_2019_D37_K1",
        articleId: article37.id,
        clauseNumber: 1,
        content:
          "Người lao động ốm đau hoặc bị tai nạn, bệnh nghề nghiệp đang điều trị, điều dưỡng theo chỉ định của cơ sở khám bệnh, chữa bệnh có thẩm quyền, trừ trường hợp quy định tại điểm b khoản 1 Điều 36 của Bộ luật này.",
      },
      {
        canonicalId: "VN_LLD_2019_D37_K2",
        articleId: article37.id,
        clauseNumber: 2,
        content: "Người lao động đang nghỉ hằng năm, nghỉ việc riêng và trường hợp nghỉ khác được người sử dụng lao động đồng ý.",
      },
      {
        canonicalId: "VN_LLD_2019_D37_K3",
        articleId: article37.id,
        clauseNumber: 3,
        content:
          "Người lao động nữ mang thai; người lao động đang nghỉ thai sản hoặc nuôi con dưới 12 tháng tuổi.",
      },
    ],
  });

  // --- Điều 38: Hủy bỏ việc đơn phương chấm dứt HĐLĐ ---
  const article38 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D38",
      documentId: doc.id,
      articleNumber: 38,
      title: "Hủy bỏ việc đơn phương chấm dứt hợp đồng lao động",
      content:
        "Mỗi bên đều có quyền hủy bỏ việc đơn phương chấm dứt hợp đồng lao động trước khi hết thời hạn báo trước nhưng phải thông báo bằng văn bản và phải được bên kia đồng ý.",
      chapter: "Chương III",
      section: "Mục 4",
    },
  });

  // --- Điều 39: Đơn phương chấm dứt HĐLĐ trái pháp luật ---
  const article39 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D39",
      documentId: doc.id,
      articleNumber: 39,
      title: "Đơn phương chấm dứt hợp đồng lao động trái pháp luật",
      content: "Đơn phương chấm dứt hợp đồng lao động trái pháp luật là trường hợp chấm dứt hợp đồng lao động không đúng quy định tại các điều 35, 36 và 37 của Bộ luật này.",
      chapter: "Chương III",
      section: "Mục 4",
    },
  });

  // --- Điều 40: Nghĩa vụ của NLĐ khi đơn phương chấm dứt HĐLĐ trái pháp luật ---
  const article40 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D40",
      documentId: doc.id,
      articleNumber: 40,
      title: "Nghĩa vụ của người lao động khi đơn phương chấm dứt hợp đồng lao động trái pháp luật",
      content: "Nghĩa vụ của người lao động khi đơn phương chấm dứt hợp đồng lao động trái pháp luật:",
      chapter: "Chương III",
      section: "Mục 4",
    },
  });

  await prisma.clause.createMany({
    data: [
      {
        canonicalId: "VN_LLD_2019_D40_K1",
        articleId: article40.id,
        clauseNumber: 1,
        content: "Không được trợ cấp thôi việc.",
      },
      {
        canonicalId: "VN_LLD_2019_D40_K2",
        articleId: article40.id,
        clauseNumber: 2,
        content:
          "Phải bồi thường cho người sử dụng lao động nửa tháng tiền lương theo hợp đồng lao động và một khoản tiền tương ứng với tiền lương theo hợp đồng lao động trong những ngày không báo trước.",
      },
      {
        canonicalId: "VN_LLD_2019_D40_K3",
        articleId: article40.id,
        clauseNumber: 3,
        content:
          "Phải hoàn trả cho người sử dụng lao động chi phí đào tạo quy định tại Điều 62 của Bộ luật này.",
      },
    ],
  });

  // --- Điều 41: Nghĩa vụ của NSDLĐ khi đơn phương chấm dứt HĐLĐ trái pháp luật ---
  const article41 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D41",
      documentId: doc.id,
      articleNumber: 41,
      title: "Nghĩa vụ của người sử dụng lao động khi đơn phương chấm dứt hợp đồng lao động trái pháp luật",
      content:
        "Nghĩa vụ của người sử dụng lao động khi đơn phương chấm dứt hợp đồng lao động trái pháp luật:",
      chapter: "Chương III",
      section: "Mục 4",
    },
  });

  await prisma.clause.createMany({
    data: [
      {
        canonicalId: "VN_LLD_2019_D41_K1",
        articleId: article41.id,
        clauseNumber: 1,
        content:
          "Phải nhận người lao động trở lại làm việc theo hợp đồng lao động đã giao kết; phải trả tiền lương, đóng bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp trong những ngày người lao động không được làm việc và phải trả thêm cho người lao động một khoản tiền ít nhất bằng 02 tháng tiền lương theo hợp đồng lao động.",
      },
      {
        canonicalId: "VN_LLD_2019_D41_K2",
        articleId: article41.id,
        clauseNumber: 2,
        content:
          "Trường hợp người lao động không muốn tiếp tục làm việc thì ngoài khoản tiền phải trả quy định tại khoản 1 Điều này, người sử dụng lao động phải trả trợ cấp thôi việc theo quy định tại Điều 46 của Bộ luật này để chấm dứt hợp đồng lao động.",
      },
      {
        canonicalId: "VN_LLD_2019_D41_K3",
        articleId: article41.id,
        clauseNumber: 3,
        content:
          "Trường hợp không còn vị trí, công việc đã giao kết trong hợp đồng lao động mà người lao động vẫn muốn làm việc thì hai bên thỏa thuận để sửa đổi, bổ sung hợp đồng lao động.",
      },
      {
        canonicalId: "VN_LLD_2019_D41_K4",
        articleId: article41.id,
        clauseNumber: 4,
        content:
          "Trường hợp vi phạm quy định về thời hạn báo trước thì phải trả một khoản tiền tương ứng với tiền lương theo hợp đồng lao động trong những ngày không báo trước.",
      },
    ],
  });

  // --- Relationships ---
  await prisma.legalRelationship.createMany({
    data: [
      {
        sourceType: "article",
        sourceCanonicalId: "VN_LLD_2019_D35",
        targetType: "article",
        targetCanonicalId: "VN_LLD_2019_D36",
        relationshipType: "related_to",
        description: "Quyền đơn phương chấm dứt HĐLĐ: NLĐ (Đ.35) và NSDLĐ (Đ.36)",
      },
      {
        sourceType: "article",
        sourceCanonicalId: "VN_LLD_2019_D36",
        targetType: "article",
        targetCanonicalId: "VN_LLD_2019_D37",
        relationshipType: "references",
        description: "Đ.36 tham chiếu các trường hợp hạn chế tại Đ.37",
      },
      {
        sourceType: "article",
        sourceCanonicalId: "VN_LLD_2019_D39",
        targetType: "article",
        targetCanonicalId: "VN_LLD_2019_D35",
        relationshipType: "references",
        description: "Đ.39 định nghĩa vi phạm dựa trên Đ.35",
      },
      {
        sourceType: "article",
        sourceCanonicalId: "VN_LLD_2019_D39",
        targetType: "article",
        targetCanonicalId: "VN_LLD_2019_D36",
        relationshipType: "references",
        description: "Đ.39 định nghĩa vi phạm dựa trên Đ.36",
      },
      {
        sourceType: "article",
        sourceCanonicalId: "VN_LLD_2019_D39",
        targetType: "article",
        targetCanonicalId: "VN_LLD_2019_D37",
        relationshipType: "references",
        description: "Đ.39 định nghĩa vi phạm dựa trên Đ.37",
      },
      {
        sourceType: "article",
        sourceCanonicalId: "VN_LLD_2019_D40",
        targetType: "article",
        targetCanonicalId: "VN_LLD_2019_D39",
        relationshipType: "related_to",
        description: "Nghĩa vụ NLĐ khi chấm dứt trái pháp luật (Đ.39)",
      },
      {
        sourceType: "article",
        sourceCanonicalId: "VN_LLD_2019_D41",
        targetType: "article",
        targetCanonicalId: "VN_LLD_2019_D39",
        relationshipType: "related_to",
        description: "Nghĩa vụ NSDLĐ khi chấm dứt trái pháp luật (Đ.39)",
      },
      {
        sourceType: "article",
        sourceCanonicalId: "VN_LLD_2019_D34",
        targetType: "article",
        targetCanonicalId: "VN_LLD_2019_D35",
        relationshipType: "references",
        description: "Khoản 9 Đ.34 tham chiếu Đ.35",
      },
      {
        sourceType: "article",
        sourceCanonicalId: "VN_LLD_2019_D34",
        targetType: "article",
        targetCanonicalId: "VN_LLD_2019_D36",
        relationshipType: "references",
        description: "Khoản 10 Đ.34 tham chiếu Đ.36",
      },
    ],
  });

  // --- Metadata ---
  await prisma.legalMetadata.createMany({
    data: [
      {
        entityType: "document",
        entityCanonicalId: "VN_LLD_2019",
        key: "gazette_number",
        value: "Công báo số 1243-1244",
      },
      {
        entityType: "document",
        entityCanonicalId: "VN_LLD_2019",
        key: "total_articles",
        value: "220",
      },
      {
        entityType: "document",
        entityCanonicalId: "VN_LLD_2019",
        key: "total_chapters",
        value: "17",
      },
      {
        entityType: "article",
        entityCanonicalId: "VN_LLD_2019_D35",
        key: "topic",
        value: "Quyền đơn phương chấm dứt HĐLĐ",
      },
      {
        entityType: "article",
        entityCanonicalId: "VN_LLD_2019_D35",
        key: "keywords",
        value: "đơn phương, chấm dứt, hợp đồng lao động, người lao động, báo trước",
      },
    ],
  });

  console.log("Seed completed successfully!");
  console.log(`Created document: ${doc.canonicalId}`);
  console.log(`Created articles: 34-41`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
