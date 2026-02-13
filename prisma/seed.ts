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

  // ================================================================
  // DOCUMENT 1: Bộ luật Lao động 2019 (Labor Code)
  // ================================================================
  const laborCode = await prisma.legalDocument.create({
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

  // ---- CHAPTER I: GENERAL PROVISIONS (Điều 1-7) ----

  const art1 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D1",
      documentId: laborCode.id,
      articleNumber: 1,
      title: "Phạm vi điều chỉnh",
      content:
        "Bộ luật Lao động quy định tiêu chuẩn lao động; quyền, nghĩa vụ, trách nhiệm của người lao động, người sử dụng lao động, tổ chức đại diện người lao động tại cơ sở, tổ chức đại diện người sử dụng lao động trong quan hệ lao động và các quan hệ khác liên quan trực tiếp đến quan hệ lao động; quản lý nhà nước về lao động.",
      chapter: "Chương I",
    },
  });

  const art2 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D2",
      documentId: laborCode.id,
      articleNumber: 2,
      title: "Đối tượng áp dụng",
      content:
        "Bộ luật này áp dụng đối với người lao động, người học nghề, người tập nghề và người làm việc không có quan hệ lao động; người sử dụng lao động; người lao động nước ngoài làm việc tại Việt Nam; cơ quan, tổ chức, cá nhân khác có liên quan trực tiếp đến quan hệ lao động.",
      chapter: "Chương I",
    },
  });

  const c2_1 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D2_K1",
      articleId: art2.id,
      clauseNumber: 1,
      content: "Người lao động, người học nghề, người tập nghề và người làm việc không có quan hệ lao động.",
    },
  });
  const c2_2 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D2_K2",
      articleId: art2.id,
      clauseNumber: 2,
      content: "Người sử dụng lao động.",
    },
  });
  const c2_3 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D2_K3",
      articleId: art2.id,
      clauseNumber: 3,
      content: "Người lao động nước ngoài làm việc tại Việt Nam.",
    },
  });
  const c2_4 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D2_K4",
      articleId: art2.id,
      clauseNumber: 4,
      content: "Cơ quan, tổ chức, cá nhân khác có liên quan trực tiếp đến quan hệ lao động.",
    },
  });

  const art3 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D3",
      documentId: laborCode.id,
      articleNumber: 3,
      title: "Giải thích từ ngữ",
      content: "Trong Bộ luật này, các từ ngữ dưới đây được hiểu như sau:",
      chapter: "Chương I",
    },
  });

  const c3_1 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D3_K1",
      articleId: art3.id,
      clauseNumber: 1,
      content:
        "Người lao động là người làm việc cho người sử dụng lao động theo thỏa thuận, được trả lương và chịu sự quản lý, điều hành, giám sát của người sử dụng lao động. Độ tuổi lao động tối thiểu của người lao động là đủ 15 tuổi, trừ trường hợp quy định tại Mục 1 Chương XI của Bộ luật này.",
    },
  });
  const c3_2 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D3_K2",
      articleId: art3.id,
      clauseNumber: 2,
      content:
        "Người sử dụng lao động là doanh nghiệp, cơ quan, tổ chức, hợp tác xã, hộ gia đình, cá nhân có thuê mướn, sử dụng người lao động làm việc cho mình theo thỏa thuận; trường hợp người sử dụng lao động là cá nhân thì phải có năng lực hành vi dân sự đầy đủ.",
    },
  });
  const c3_3 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D3_K3",
      articleId: art3.id,
      clauseNumber: 3,
      content: "Tổ chức đại diện người lao động tại cơ sở là tổ chức được thành lập trên cơ sở tự nguyện của người lao động tại một đơn vị sử dụng lao động nhằm mục đích bảo vệ quyền và lợi ích hợp pháp, chính đáng của người lao động trong quan hệ lao động thông qua thương lượng tập thể hoặc các hình thức khác theo quy định của pháp luật về lao động. Tổ chức đại diện người lao động tại cơ sở bao gồm công đoàn cơ sở và tổ chức của người lao động tại doanh nghiệp.",
    },
  });
  const c3_4 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D3_K4",
      articleId: art3.id,
      clauseNumber: 4,
      content: "Tổ chức đại diện người sử dụng lao động là tổ chức được thành lập hợp pháp, đại diện và bảo vệ quyền, lợi ích hợp pháp của người sử dụng lao động trong quan hệ lao động.",
    },
  });
  const c3_5 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D3_K5",
      articleId: art3.id,
      clauseNumber: 5,
      content: "Quan hệ lao động là quan hệ xã hội phát sinh trong việc thuê mướn, sử dụng lao động, trả lương giữa người lao động, người sử dụng lao động, các tổ chức đại diện của các bên, cơ quan nhà nước có thẩm quyền. Quan hệ lao động bao gồm quan hệ lao động cá nhân và quan hệ lao động tập thể.",
    },
  });
  const c3_6 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D3_K6",
      articleId: art3.id,
      clauseNumber: 6,
      content: "Cưỡng bức lao động là việc dùng vũ lực, đe dọa dùng vũ lực hoặc các thủ đoạn khác để ép buộc người lao động phải làm việc trái ý muốn của họ.",
    },
  });
  const c3_7 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D3_K7",
      articleId: art3.id,
      clauseNumber: 7,
      content: "Phân biệt đối xử trong lao động là hành vi phân biệt, loại trừ hoặc ưu tiên dựa trên chủng tộc, màu da, nguồn gốc quốc gia hoặc nguồn gốc xã hội, dân tộc, giới tính, độ tuổi, tình trạng thai sản, tình trạng hôn nhân, tôn giáo, tín ngưỡng, chính kiến, khuyết tật, trách nhiệm gia đình hoặc trên cơ sở tình trạng nhiễm HIV hoặc vì lý do thành lập, gia nhập và hoạt động công đoàn, tổ chức của người lao động tại doanh nghiệp có tác động làm ảnh hưởng đến bình đẳng về cơ hội việc làm hoặc nghề nghiệp.",
    },
  });
  const c3_8 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D3_K8",
      articleId: art3.id,
      clauseNumber: 8,
      content: "Quấy rối tình dục tại nơi làm việc là hành vi có tính chất tình dục của bất kỳ người nào đối với người khác tại nơi làm việc mà không được người đó mong muốn hoặc chấp nhận. Nơi làm việc là bất kỳ nơi nào mà người lao động thực tế làm việc theo thỏa thuận hoặc phân công của người sử dụng lao động.",
    },
  });

  const art4 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D4",
      documentId: laborCode.id,
      articleNumber: 4,
      title: "Chính sách của Nhà nước về lao động",
      content: "Nhà nước có các chính sách sau đây về lao động:",
      chapter: "Chương I",
    },
  });

  await prisma.clause.createMany({
    data: [
      {
        canonicalId: "VN_LLD_2019_D4_K1",
        articleId: art4.id,
        clauseNumber: 1,
        content: "Bảo đảm quyền và lợi ích hợp pháp, chính đáng của người lao động, người làm việc không có quan hệ lao động; khuyến khích những thỏa thuận bảo đảm cho người lao động có điều kiện thuận lợi hơn so với quy định của pháp luật về lao động.",
      },
      {
        canonicalId: "VN_LLD_2019_D4_K2",
        articleId: art4.id,
        clauseNumber: 2,
        content: "Bảo đảm quyền và lợi ích hợp pháp của người sử dụng lao động, quản lý lao động đúng pháp luật, dân chủ, công bằng, văn minh và nâng cao trách nhiệm xã hội.",
      },
      {
        canonicalId: "VN_LLD_2019_D4_K3",
        articleId: art4.id,
        clauseNumber: 3,
        content: "Tạo điều kiện thuận lợi đối với hoạt động tạo việc làm, tự tạo việc làm, dạy nghề và học nghề để có việc làm; hoạt động sản xuất, kinh doanh thu hút nhiều lao động; áp dụng một số quy định của Bộ luật này đối với người làm việc không có quan hệ lao động.",
      },
      {
        canonicalId: "VN_LLD_2019_D4_K4",
        articleId: art4.id,
        clauseNumber: 4,
        content: "Có chính sách phát triển, phân bố nguồn nhân lực; nâng cao năng suất lao động; đào tạo, bồi dưỡng và nâng cao trình độ, kỹ năng nghề cho người lao động; hỗ trợ duy trì, chuyển đổi nghề nghiệp, việc làm cho người lao động; ưu đãi đối với người sử dụng lao động sử dụng nhiều lao động nữ, lao động là người khuyết tật, lao động là người dân tộc thiểu số.",
      },
      {
        canonicalId: "VN_LLD_2019_D4_K5",
        articleId: art4.id,
        clauseNumber: 5,
        content: "Có chính sách phát triển thị trường lao động, đa dạng các hình thức kết nối cung, cầu lao động.",
      },
      {
        canonicalId: "VN_LLD_2019_D4_K6",
        articleId: art4.id,
        clauseNumber: 6,
        content: "Thúc đẩy người lao động và người sử dụng lao động đối thoại, thương lượng tập thể, xây dựng quan hệ lao động tiến bộ, hài hòa và ổn định.",
      },
      {
        canonicalId: "VN_LLD_2019_D4_K7",
        articleId: art4.id,
        clauseNumber: 7,
        content: "Bảo đảm bình đẳng giới; quy định chế độ lao động và chính sách xã hội nhằm bảo vệ lao động nữ, lao động là người khuyết tật, người lao động cao tuổi, lao động chưa thành niên.",
      },
    ],
  });

  const art5 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D5",
      documentId: laborCode.id,
      articleNumber: 5,
      title: "Quyền và nghĩa vụ của người lao động",
      content: "Người lao động có các quyền và nghĩa vụ sau đây:",
      chapter: "Chương I",
    },
  });

  const c5_1 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D5_K1",
      articleId: art5.id,
      clauseNumber: 1,
      content: "Người lao động có các quyền sau đây:",
    },
  });

  await prisma.point.createMany({
    data: [
      { canonicalId: "VN_LLD_2019_D5_K1_A", clauseId: c5_1.id, pointLetter: "a", content: "Làm việc; tự do lựa chọn việc làm, nơi làm việc, nghề nghiệp, học nghề, nâng cao trình độ nghề nghiệp; không bị phân biệt đối xử, cưỡng bức lao động, quấy rối tình dục tại nơi làm việc;" },
      { canonicalId: "VN_LLD_2019_D5_K1_B", clauseId: c5_1.id, pointLetter: "b", content: "Hưởng lương phù hợp với trình độ, kỹ năng nghề trên cơ sở thỏa thuận với người sử dụng lao động; được bảo hộ lao động, làm việc trong điều kiện bảo đảm về an toàn, vệ sinh lao động; nghỉ theo chế độ, nghỉ hằng năm có lương và được hưởng phúc lợi tập thể;" },
      { canonicalId: "VN_LLD_2019_D5_K1_C", clauseId: c5_1.id, pointLetter: "c", content: "Thành lập, gia nhập, hoạt động trong tổ chức đại diện người lao động, tổ chức nghề nghiệp và tổ chức khác theo quy định của pháp luật; yêu cầu và tham gia đối thoại, thực hiện quy chế dân chủ, thương lượng tập thể với người sử dụng lao động và được tham vấn tại nơi làm việc để bảo vệ quyền và lợi ích hợp pháp, chính đáng của mình; tham gia quản lý theo nội quy của người sử dụng lao động;" },
      { canonicalId: "VN_LLD_2019_D5_K1_D", clauseId: c5_1.id, pointLetter: "d", content: "Từ chối làm việc nếu có nguy cơ rõ ràng đe dọa trực tiếp đến tính mạng, sức khỏe trong quá trình thực hiện công việc;" },
      { canonicalId: "VN_LLD_2019_D5_K1_DD", clauseId: c5_1.id, pointLetter: "e", content: "Đơn phương chấm dứt hợp đồng lao động;" },
      { canonicalId: "VN_LLD_2019_D5_K1_E", clauseId: c5_1.id, pointLetter: "f", content: "Đình công;" },
      { canonicalId: "VN_LLD_2019_D5_K1_G", clauseId: c5_1.id, pointLetter: "g", content: "Các quyền khác theo quy định của pháp luật." },
    ],
  });

  const c5_2 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D5_K2",
      articleId: art5.id,
      clauseNumber: 2,
      content: "Người lao động có các nghĩa vụ sau đây:",
    },
  });

  await prisma.point.createMany({
    data: [
      { canonicalId: "VN_LLD_2019_D5_K2_A", clauseId: c5_2.id, pointLetter: "a", content: "Thực hiện hợp đồng lao động, thỏa ước lao động tập thể và thỏa thuận hợp pháp khác;" },
      { canonicalId: "VN_LLD_2019_D5_K2_B", clauseId: c5_2.id, pointLetter: "b", content: "Chấp hành kỷ luật lao động, nội quy lao động; tuân theo sự quản lý, điều hành, giám sát của người sử dụng lao động;" },
      { canonicalId: "VN_LLD_2019_D5_K2_C", clauseId: c5_2.id, pointLetter: "c", content: "Thực hiện quy định của pháp luật về lao động, việc làm, giáo dục nghề nghiệp, bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp và an toàn, vệ sinh lao động." },
    ],
  });

  const art6 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D6",
      documentId: laborCode.id,
      articleNumber: 6,
      title: "Quyền và nghĩa vụ của người sử dụng lao động",
      content: "Người sử dụng lao động có các quyền và nghĩa vụ sau đây:",
      chapter: "Chương I",
    },
  });

  const c6_1 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D6_K1",
      articleId: art6.id,
      clauseNumber: 1,
      content: "Người sử dụng lao động có các quyền sau đây:",
    },
  });

  await prisma.point.createMany({
    data: [
      { canonicalId: "VN_LLD_2019_D6_K1_A", clauseId: c6_1.id, pointLetter: "a", content: "Tuyển dụng, bố trí, quản lý, điều hành, giám sát lao động; khen thưởng và xử lý vi phạm kỷ luật lao động;" },
      { canonicalId: "VN_LLD_2019_D6_K1_B", clauseId: c6_1.id, pointLetter: "b", content: "Thành lập, gia nhập, hoạt động trong tổ chức đại diện người sử dụng lao động, tổ chức nghề nghiệp và tổ chức khác theo quy định của pháp luật;" },
      { canonicalId: "VN_LLD_2019_D6_K1_C", clauseId: c6_1.id, pointLetter: "c", content: "Yêu cầu tổ chức đại diện người lao động thương lượng với mục đích ký kết thỏa ước lao động tập thể; tham gia giải quyết tranh chấp lao động, đình công; đối thoại, trao đổi với tổ chức đại diện người lao động về các vấn đề trong quan hệ lao động, cải thiện đời sống vật chất và tinh thần của người lao động;" },
      { canonicalId: "VN_LLD_2019_D6_K1_D", clauseId: c6_1.id, pointLetter: "d", content: "Đóng cửa tạm thời nơi làm việc;" },
      { canonicalId: "VN_LLD_2019_D6_K1_DD", clauseId: c6_1.id, pointLetter: "e", content: "Các quyền khác theo quy định của pháp luật." },
    ],
  });

  const c6_2 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D6_K2",
      articleId: art6.id,
      clauseNumber: 2,
      content: "Người sử dụng lao động có các nghĩa vụ sau đây:",
    },
  });

  await prisma.point.createMany({
    data: [
      { canonicalId: "VN_LLD_2019_D6_K2_A", clauseId: c6_2.id, pointLetter: "a", content: "Thực hiện hợp đồng lao động, thỏa ước lao động tập thể và thỏa thuận hợp pháp khác; tôn trọng danh dự, nhân phẩm của người lao động;" },
      { canonicalId: "VN_LLD_2019_D6_K2_B", clauseId: c6_2.id, pointLetter: "b", content: "Thiết lập cơ chế và thực hiện đối thoại, trao đổi với người lao động và tổ chức đại diện người lao động; thực hiện quy chế dân chủ ở cơ sở tại nơi làm việc;" },
      { canonicalId: "VN_LLD_2019_D6_K2_C", clauseId: c6_2.id, pointLetter: "c", content: "Đào tạo, đào tạo lại, bồi dưỡng nâng cao trình độ, kỹ năng nghề nhằm duy trì, chuyển đổi nghề nghiệp, việc làm cho người lao động;" },
      { canonicalId: "VN_LLD_2019_D6_K2_D", clauseId: c6_2.id, pointLetter: "d", content: "Thực hiện quy định của pháp luật về lao động, việc làm, giáo dục nghề nghiệp, bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp và an toàn, vệ sinh lao động; xây dựng và thực hiện các giải pháp phòng, chống quấy rối tình dục tại nơi làm việc;" },
      { canonicalId: "VN_LLD_2019_D6_K2_DD", clauseId: c6_2.id, pointLetter: "e", content: "Tham gia phát triển tiêu chuẩn kỹ năng nghề quốc gia, đánh giá, công nhận kỹ năng nghề cho người lao động." },
    ],
  });

  const art7 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D7",
      documentId: laborCode.id,
      articleNumber: 7,
      title: "Xây dựng quan hệ lao động",
      content: "Xây dựng quan hệ lao động tiến bộ, hài hòa và ổn định:",
      chapter: "Chương I",
    },
  });

  await prisma.clause.createMany({
    data: [
      {
        canonicalId: "VN_LLD_2019_D7_K1",
        articleId: art7.id,
        clauseNumber: 1,
        content: "Quan hệ lao động được xác lập qua đối thoại, thương lượng, thỏa thuận theo nguyên tắc tự nguyện, thiện chí, bình đẳng, hợp tác, tôn trọng quyền và lợi ích hợp pháp của nhau.",
      },
      {
        canonicalId: "VN_LLD_2019_D7_K2",
        articleId: art7.id,
        clauseNumber: 2,
        content: "Người sử dụng lao động, tổ chức đại diện người sử dụng lao động và người lao động, tổ chức đại diện người lao động xây dựng quan hệ lao động tiến bộ, hài hòa và ổn định với sự hỗ trợ của cơ quan nhà nước có thẩm quyền.",
      },
      {
        canonicalId: "VN_LLD_2019_D7_K3",
        articleId: art7.id,
        clauseNumber: 3,
        content: "Công đoàn tham gia cùng với cơ quan nhà nước có thẩm quyền, tổ chức đại diện người sử dụng lao động hỗ trợ xây dựng quan hệ lao động tiến bộ, hài hòa và ổn định; giám sát việc thi hành quy định của pháp luật về lao động; bảo vệ quyền và lợi ích hợp pháp, chính đáng của người lao động.",
      },
      {
        canonicalId: "VN_LLD_2019_D7_K4",
        articleId: art7.id,
        clauseNumber: 4,
        content: "Phòng Thương mại và Công nghiệp Việt Nam, Liên minh Hợp tác xã Việt Nam và các tổ chức đại diện của người sử dụng lao động được thành lập theo quy định của pháp luật có vai trò đại diện, bảo vệ quyền và lợi ích hợp pháp của người sử dụng lao động, tham gia xây dựng quan hệ lao động tiến bộ, hài hòa và ổn định.",
      },
    ],
  });

  // ---- CHAPTER III, Section 4: Contract termination (Điều 34-41) ----

  const article34 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D34",
      documentId: laborCode.id,
      articleNumber: 34,
      title: "Các trường hợp chấm dứt hợp đồng lao động",
      content: "Hợp đồng lao động chấm dứt trong trường hợp sau đây:",
      chapter: "Chương III",
      section: "Mục 4",
    },
  });

  await prisma.clause.createMany({
    data: [
      { canonicalId: "VN_LLD_2019_D34_K1", articleId: article34.id, clauseNumber: 1, content: "Hết hạn hợp đồng lao động, trừ trường hợp quy định tại khoản 4 Điều 177 của Bộ luật này." },
      { canonicalId: "VN_LLD_2019_D34_K2", articleId: article34.id, clauseNumber: 2, content: "Đã hoàn thành công việc theo hợp đồng lao động." },
      { canonicalId: "VN_LLD_2019_D34_K3", articleId: article34.id, clauseNumber: 3, content: "Hai bên thỏa thuận chấm dứt hợp đồng lao động." },
      { canonicalId: "VN_LLD_2019_D34_K4", articleId: article34.id, clauseNumber: 4, content: "Người lao động bị kết án phạt tù nhưng không được hưởng án treo hoặc không thuộc trường hợp được trả tự do theo quy định tại khoản 5 Điều 328 của Bộ luật Tố tụng hình sự, tử hình hoặc bị cấm làm công việc ghi trong hợp đồng lao động theo bản án, quyết định của Tòa án đã có hiệu lực pháp luật." },
      { canonicalId: "VN_LLD_2019_D34_K5", articleId: article34.id, clauseNumber: 5, content: "Người lao động là người nước ngoài làm việc tại Việt Nam bị trục xuất theo bản án, quyết định của Tòa án đã có hiệu lực pháp luật, quyết định của cơ quan nhà nước có thẩm quyền." },
      { canonicalId: "VN_LLD_2019_D34_K6", articleId: article34.id, clauseNumber: 6, content: "Người lao động chết; bị Tòa án tuyên bố mất năng lực hành vi dân sự, mất tích hoặc đã chết." },
      { canonicalId: "VN_LLD_2019_D34_K7", articleId: article34.id, clauseNumber: 7, content: "Người sử dụng lao động là cá nhân chết; bị Tòa án tuyên bố mất năng lực hành vi dân sự, mất tích hoặc đã chết. Người sử dụng lao động không phải là cá nhân chấm dứt hoạt động hoặc bị cơ quan chuyên môn về đăng ký kinh doanh thuộc Ủy ban nhân dân cấp tỉnh ra thông báo không có người đại diện theo pháp luật, người được ủy quyền thực hiện quyền và nghĩa vụ của người đại diện theo pháp luật." },
      { canonicalId: "VN_LLD_2019_D34_K8", articleId: article34.id, clauseNumber: 8, content: "Người lao động bị xử lý kỷ luật sa thải." },
      { canonicalId: "VN_LLD_2019_D34_K9", articleId: article34.id, clauseNumber: 9, content: "Người lao động đơn phương chấm dứt hợp đồng lao động theo quy định tại Điều 35 của Bộ luật này." },
      { canonicalId: "VN_LLD_2019_D34_K10", articleId: article34.id, clauseNumber: 10, content: "Người sử dụng lao động đơn phương chấm dứt hợp đồng lao động theo quy định tại Điều 36 của Bộ luật này." },
      { canonicalId: "VN_LLD_2019_D34_K11", articleId: article34.id, clauseNumber: 11, content: "Người sử dụng lao động cho người lao động thôi việc theo quy định tại Điều 42 và Điều 43 của Bộ luật này." },
      { canonicalId: "VN_LLD_2019_D34_K12", articleId: article34.id, clauseNumber: 12, content: "Giấy phép lao động hết hiệu lực đối với người lao động là người nước ngoài làm việc tại Việt Nam theo quy định tại Điều 156 của Bộ luật này." },
      { canonicalId: "VN_LLD_2019_D34_K13", articleId: article34.id, clauseNumber: 13, content: "Trường hợp thỏa thuận nội dung thử việc ghi trong hợp đồng lao động mà thử việc không đạt yêu cầu hoặc một bên hủy bỏ thỏa thuận thử việc." },
    ],
  });

  // --- Điều 35 ---
  const article35 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D35",
      documentId: laborCode.id,
      articleNumber: 35,
      title: "Quyền đơn phương chấm dứt hợp đồng lao động của người lao động",
      content: "Người lao động có quyền đơn phương chấm dứt hợp đồng lao động nhưng phải báo trước cho người sử dụng lao động theo quy định sau đây:",
      chapter: "Chương III",
      section: "Mục 4",
    },
  });

  const clause35_1 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D35_K1",
      articleId: article35.id,
      clauseNumber: 1,
      content: "Người lao động có quyền đơn phương chấm dứt hợp đồng lao động nhưng phải báo trước cho người sử dụng lao động như sau:",
    },
  });

  await prisma.point.createMany({
    data: [
      { canonicalId: "VN_LLD_2019_D35_K1_A", clauseId: clause35_1.id, pointLetter: "a", content: "Ít nhất 45 ngày nếu làm việc theo hợp đồng lao động không xác định thời hạn;" },
      { canonicalId: "VN_LLD_2019_D35_K1_B", clauseId: clause35_1.id, pointLetter: "b", content: "Ít nhất 30 ngày nếu làm việc theo hợp đồng lao động xác định thời hạn có thời hạn từ 12 tháng đến 36 tháng;" },
      { canonicalId: "VN_LLD_2019_D35_K1_C", clauseId: clause35_1.id, pointLetter: "c", content: "Ít nhất 03 ngày làm việc nếu làm việc theo hợp đồng lao động xác định thời hạn có thời hạn dưới 12 tháng;" },
      { canonicalId: "VN_LLD_2019_D35_K1_D", clauseId: clause35_1.id, pointLetter: "d", content: "Đối với một số ngành, nghề, công việc đặc thù thì thời hạn báo trước theo quy định của Chính phủ." },
    ],
  });

  const clause35_2 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D35_K2",
      articleId: article35.id,
      clauseNumber: 2,
      content: "Người lao động có quyền đơn phương chấm dứt hợp đồng lao động không cần báo trước trong trường hợp sau đây:",
    },
  });

  await prisma.point.createMany({
    data: [
      { canonicalId: "VN_LLD_2019_D35_K2_A", clauseId: clause35_2.id, pointLetter: "a", content: "Không được bố trí theo đúng công việc, địa điểm làm việc hoặc không được bảo đảm điều kiện làm việc theo thỏa thuận, trừ trường hợp quy định tại Điều 29 của Bộ luật này;" },
      { canonicalId: "VN_LLD_2019_D35_K2_B", clauseId: clause35_2.id, pointLetter: "b", content: "Không được trả đủ lương hoặc trả lương không đúng thời hạn, trừ trường hợp quy định tại khoản 4 Điều 97 của Bộ luật này;" },
      { canonicalId: "VN_LLD_2019_D35_K2_C", clauseId: clause35_2.id, pointLetter: "c", content: "Bị người sử dụng lao động ngược đãi, đánh đập hoặc có lời nói, hành vi nhục mạ, hành vi làm ảnh hưởng đến sức khỏe, nhân phẩm, danh dự; bị cưỡng bức lao động;" },
      { canonicalId: "VN_LLD_2019_D35_K2_D", clauseId: clause35_2.id, pointLetter: "d", content: "Bị quấy rối tình dục tại nơi làm việc;" },
      { canonicalId: "VN_LLD_2019_D35_K2_DD", clauseId: clause35_2.id, pointLetter: "e", content: "Lao động nữ mang thai phải nghỉ việc theo quy định tại khoản 1 Điều 138 của Bộ luật này;" },
      { canonicalId: "VN_LLD_2019_D35_K2_E", clauseId: clause35_2.id, pointLetter: "f", content: "Đủ tuổi nghỉ hưu theo quy định tại Điều 169 của Bộ luật này, trừ trường hợp các bên có thỏa thuận khác;" },
      { canonicalId: "VN_LLD_2019_D35_K2_G", clauseId: clause35_2.id, pointLetter: "g", content: "Người sử dụng lao động cung cấp thông tin không trung thực theo quy định tại khoản 1 Điều 16 của Bộ luật này làm ảnh hưởng đến việc thực hiện hợp đồng lao động." },
    ],
  });

  // --- Điều 36 ---
  const article36 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D36",
      documentId: laborCode.id,
      articleNumber: 36,
      title: "Quyền đơn phương chấm dứt hợp đồng lao động của người sử dụng lao động",
      content: "Người sử dụng lao động có quyền đơn phương chấm dứt hợp đồng lao động trong trường hợp sau đây:",
      chapter: "Chương III",
      section: "Mục 4",
    },
  });

  const clause36_1 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D36_K1",
      articleId: article36.id,
      clauseNumber: 1,
      content: "Người sử dụng lao động có quyền đơn phương chấm dứt hợp đồng lao động trong trường hợp sau đây:",
    },
  });

  await prisma.point.createMany({
    data: [
      { canonicalId: "VN_LLD_2019_D36_K1_A", clauseId: clause36_1.id, pointLetter: "a", content: "Người lao động thường xuyên không hoàn thành công việc theo hợp đồng lao động được xác định theo tiêu chí đánh giá mức độ hoàn thành công việc trong quy chế của người sử dụng lao động. Quy chế đánh giá mức độ hoàn thành công việc do người sử dụng lao động ban hành nhưng phải tham khảo ý kiến tổ chức đại diện người lao động tại cơ sở đối với nơi có tổ chức đại diện người lao động tại cơ sở;" },
      { canonicalId: "VN_LLD_2019_D36_K1_B", clauseId: clause36_1.id, pointLetter: "b", content: "Người lao động bị ốm đau, tai nạn đã điều trị 12 tháng liên tục đối với người làm việc theo hợp đồng lao động không xác định thời hạn hoặc đã điều trị 06 tháng liên tục đối với người làm việc theo hợp đồng lao động xác định thời hạn có thời hạn từ 12 tháng đến 36 tháng hoặc quá nửa thời hạn hợp đồng lao động đối với người làm việc theo hợp đồng lao động xác định thời hạn có thời hạn dưới 12 tháng mà khả năng lao động chưa hồi phục;" },
      { canonicalId: "VN_LLD_2019_D36_K1_C", clauseId: clause36_1.id, pointLetter: "c", content: "Do thiên tai, hỏa hoạn, dịch bệnh nguy hiểm, địch họa hoặc di dời, thu hẹp sản xuất, kinh doanh theo yêu cầu của cơ quan nhà nước có thẩm quyền mà người sử dụng lao động đã tìm mọi biện pháp khắc phục nhưng vẫn buộc phải giảm chỗ làm việc;" },
      { canonicalId: "VN_LLD_2019_D36_K1_D", clauseId: clause36_1.id, pointLetter: "d", content: "Người lao động không có mặt tại nơi làm việc sau thời hạn quy định tại Điều 31 của Bộ luật này;" },
      { canonicalId: "VN_LLD_2019_D36_K1_DD", clauseId: clause36_1.id, pointLetter: "e", content: "Người lao động đủ tuổi nghỉ hưu theo quy định tại Điều 169 của Bộ luật này, trừ trường hợp có thỏa thuận khác;" },
      { canonicalId: "VN_LLD_2019_D36_K1_E", clauseId: clause36_1.id, pointLetter: "f", content: "Người lao động tự ý bỏ việc mà không có lý do chính đáng từ 05 ngày làm việc liên tục trở lên;" },
      { canonicalId: "VN_LLD_2019_D36_K1_G", clauseId: clause36_1.id, pointLetter: "g", content: "Người lao động cung cấp không trung thực thông tin theo quy định tại khoản 2 Điều 16 của Bộ luật này khi giao kết hợp đồng lao động làm ảnh hưởng đến việc tuyển dụng người lao động." },
    ],
  });

  const clause36_2 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D36_K2",
      articleId: article36.id,
      clauseNumber: 2,
      content: "Khi đơn phương chấm dứt hợp đồng lao động, người sử dụng lao động phải báo trước cho người lao động như sau:",
    },
  });

  await prisma.point.createMany({
    data: [
      { canonicalId: "VN_LLD_2019_D36_K2_A", clauseId: clause36_2.id, pointLetter: "a", content: "Ít nhất 45 ngày đối với hợp đồng lao động không xác định thời hạn;" },
      { canonicalId: "VN_LLD_2019_D36_K2_B", clauseId: clause36_2.id, pointLetter: "b", content: "Ít nhất 30 ngày đối với hợp đồng lao động xác định thời hạn có thời hạn từ 12 tháng đến 36 tháng;" },
      { canonicalId: "VN_LLD_2019_D36_K2_C", clauseId: clause36_2.id, pointLetter: "c", content: "Ít nhất 03 ngày làm việc đối với hợp đồng lao động xác định thời hạn có thời hạn dưới 12 tháng và đối với trường hợp quy định tại điểm b khoản 1 Điều này;" },
      { canonicalId: "VN_LLD_2019_D36_K2_D", clauseId: clause36_2.id, pointLetter: "d", content: "Đối với một số ngành, nghề, công việc đặc thù thì thời hạn báo trước theo quy định của Chính phủ." },
    ],
  });

  await prisma.clause.create({
    data: {
      canonicalId: "VN_LLD_2019_D36_K3",
      articleId: article36.id,
      clauseNumber: 3,
      content: "Người sử dụng lao động không được thực hiện quyền đơn phương chấm dứt hợp đồng lao động đối với trường hợp quy định tại Điều 37 của Bộ luật này.",
    },
  });

  // --- Điều 37 ---
  const article37 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D37",
      documentId: laborCode.id,
      articleNumber: 37,
      title: "Trường hợp người sử dụng lao động không được thực hiện quyền đơn phương chấm dứt hợp đồng lao động",
      content: "Người sử dụng lao động không được thực hiện quyền đơn phương chấm dứt hợp đồng lao động trong trường hợp sau đây:",
      chapter: "Chương III",
      section: "Mục 4",
    },
  });

  await prisma.clause.createMany({
    data: [
      { canonicalId: "VN_LLD_2019_D37_K1", articleId: article37.id, clauseNumber: 1, content: "Người lao động ốm đau hoặc bị tai nạn, bệnh nghề nghiệp đang điều trị, điều dưỡng theo chỉ định của cơ sở khám bệnh, chữa bệnh có thẩm quyền, trừ trường hợp quy định tại điểm b khoản 1 Điều 36 của Bộ luật này." },
      { canonicalId: "VN_LLD_2019_D37_K2", articleId: article37.id, clauseNumber: 2, content: "Người lao động đang nghỉ hằng năm, nghỉ việc riêng và trường hợp nghỉ khác được người sử dụng lao động đồng ý." },
      { canonicalId: "VN_LLD_2019_D37_K3", articleId: article37.id, clauseNumber: 3, content: "Người lao động nữ mang thai; người lao động đang nghỉ thai sản hoặc nuôi con dưới 12 tháng tuổi." },
    ],
  });

  // --- Điều 38-41 (compact) ---
  await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D38",
      documentId: laborCode.id,
      articleNumber: 38,
      title: "Hủy bỏ việc đơn phương chấm dứt hợp đồng lao động",
      content: "Mỗi bên đều có quyền hủy bỏ việc đơn phương chấm dứt hợp đồng lao động trước khi hết thời hạn báo trước nhưng phải thông báo bằng văn bản và phải được bên kia đồng ý.",
      chapter: "Chương III",
      section: "Mục 4",
    },
  });

  await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D39",
      documentId: laborCode.id,
      articleNumber: 39,
      title: "Đơn phương chấm dứt hợp đồng lao động trái pháp luật",
      content: "Đơn phương chấm dứt hợp đồng lao động trái pháp luật là trường hợp chấm dứt hợp đồng lao động không đúng quy định tại các điều 35, 36 và 37 của Bộ luật này.",
      chapter: "Chương III",
      section: "Mục 4",
    },
  });

  const article40 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D40",
      documentId: laborCode.id,
      articleNumber: 40,
      title: "Nghĩa vụ của người lao động khi đơn phương chấm dứt hợp đồng lao động trái pháp luật",
      content: "Nghĩa vụ của người lao động khi đơn phương chấm dứt hợp đồng lao động trái pháp luật:",
      chapter: "Chương III",
      section: "Mục 4",
    },
  });

  await prisma.clause.createMany({
    data: [
      { canonicalId: "VN_LLD_2019_D40_K1", articleId: article40.id, clauseNumber: 1, content: "Không được trợ cấp thôi việc." },
      { canonicalId: "VN_LLD_2019_D40_K2", articleId: article40.id, clauseNumber: 2, content: "Phải bồi thường cho người sử dụng lao động nửa tháng tiền lương theo hợp đồng lao động và một khoản tiền tương ứng với tiền lương theo hợp đồng lao động trong những ngày không báo trước." },
      { canonicalId: "VN_LLD_2019_D40_K3", articleId: article40.id, clauseNumber: 3, content: "Phải hoàn trả cho người sử dụng lao động chi phí đào tạo quy định tại Điều 62 của Bộ luật này." },
    ],
  });

  const article41 = await prisma.article.create({
    data: {
      canonicalId: "VN_LLD_2019_D41",
      documentId: laborCode.id,
      articleNumber: 41,
      title: "Nghĩa vụ của người sử dụng lao động khi đơn phương chấm dứt hợp đồng lao động trái pháp luật",
      content: "Nghĩa vụ của người sử dụng lao động khi đơn phương chấm dứt hợp đồng lao động trái pháp luật:",
      chapter: "Chương III",
      section: "Mục 4",
    },
  });

  await prisma.clause.createMany({
    data: [
      { canonicalId: "VN_LLD_2019_D41_K1", articleId: article41.id, clauseNumber: 1, content: "Phải nhận người lao động trở lại làm việc theo hợp đồng lao động đã giao kết; phải trả tiền lương, đóng bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp trong những ngày người lao động không được làm việc và phải trả thêm cho người lao động một khoản tiền ít nhất bằng 02 tháng tiền lương theo hợp đồng lao động." },
      { canonicalId: "VN_LLD_2019_D41_K2", articleId: article41.id, clauseNumber: 2, content: "Trường hợp người lao động không muốn tiếp tục làm việc thì ngoài khoản tiền phải trả quy định tại khoản 1 Điều này, người sử dụng lao động phải trả trợ cấp thôi việc theo quy định tại Điều 46 của Bộ luật này để chấm dứt hợp đồng lao động." },
      { canonicalId: "VN_LLD_2019_D41_K3", articleId: article41.id, clauseNumber: 3, content: "Trường hợp không còn vị trí, công việc đã giao kết trong hợp đồng lao động mà người lao động vẫn muốn làm việc thì hai bên thỏa thuận để sửa đổi, bổ sung hợp đồng lao động." },
      { canonicalId: "VN_LLD_2019_D41_K4", articleId: article41.id, clauseNumber: 4, content: "Trường hợp vi phạm quy định về thời hạn báo trước thì phải trả một khoản tiền tương ứng với tiền lương theo hợp đồng lao động trong những ngày không báo trước." },
    ],
  });

  // ================================================================
  // DOCUMENT 2: Bộ luật Dân sự 2015 (Civil Code)
  // ================================================================
  const civilCode = await prisma.legalDocument.create({
    data: {
      canonicalId: "VN_BLDS_2015",
      title: "Bộ luật Dân sự",
      documentNumber: "91/2015/QH13",
      documentType: "luat",
      issuingBody: "Quốc hội",
      issuedDate: new Date("2015-11-24"),
      effectiveDate: new Date("2017-01-01"),
      slug: "bo-luat-dan-su",
      year: 2015,
      status: "active",
    },
  });

  // ---- Chapter I: General Provisions ----
  const cc_art1 = await prisma.article.create({
    data: {
      canonicalId: "VN_BLDS_2015_D1",
      documentId: civilCode.id,
      articleNumber: 1,
      title: "Phạm vi điều chỉnh",
      content: "Bộ luật này quy định địa vị pháp lý, chuẩn mực pháp lý về cách ứng xử của cá nhân, pháp nhân; quyền, nghĩa vụ về nhân thân và tài sản của cá nhân, pháp nhân trong các quan hệ được hình thành trên cơ sở bình đẳng, tự do ý chí, độc lập về tài sản và tự chịu trách nhiệm (sau đây gọi chung là quan hệ dân sự).",
      chapter: "Phần thứ nhất - Chương I",
    },
  });

  const cc_art2 = await prisma.article.create({
    data: {
      canonicalId: "VN_BLDS_2015_D2",
      documentId: civilCode.id,
      articleNumber: 2,
      title: "Công nhận, tôn trọng, bảo vệ và bảo đảm quyền dân sự",
      content: "Ở nước Cộng hòa xã hội chủ nghĩa Việt Nam, các quyền dân sự được công nhận, tôn trọng, bảo vệ và bảo đảm theo Hiến pháp và pháp luật.",
      chapter: "Phần thứ nhất - Chương I",
    },
  });

  await prisma.clause.createMany({
    data: [
      { canonicalId: "VN_BLDS_2015_D2_K1", articleId: cc_art2.id, clauseNumber: 1, content: "Ở nước Cộng hòa xã hội chủ nghĩa Việt Nam, các quyền dân sự được công nhận, tôn trọng, bảo vệ và bảo đảm theo Hiến pháp và pháp luật." },
      { canonicalId: "VN_BLDS_2015_D2_K2", articleId: cc_art2.id, clauseNumber: 2, content: "Quyền dân sự chỉ có thể bị hạn chế theo quy định của luật trong trường hợp cần thiết vì lý do quốc phòng, an ninh quốc gia, trật tự, an toàn xã hội, đạo đức xã hội, sức khỏe của cộng đồng." },
    ],
  });

  const cc_art3 = await prisma.article.create({
    data: {
      canonicalId: "VN_BLDS_2015_D3",
      documentId: civilCode.id,
      articleNumber: 3,
      title: "Các nguyên tắc cơ bản của pháp luật dân sự",
      content: "Pháp luật dân sự được xây dựng trên các nguyên tắc cơ bản sau đây:",
      chapter: "Phần thứ nhất - Chương I",
    },
  });

  await prisma.clause.createMany({
    data: [
      { canonicalId: "VN_BLDS_2015_D3_K1", articleId: cc_art3.id, clauseNumber: 1, content: "Mọi cá nhân, pháp nhân đều bình đẳng, không được lấy bất kỳ lý do nào để phân biệt đối xử; được pháp luật bảo hộ như nhau về các quyền nhân thân và tài sản." },
      { canonicalId: "VN_BLDS_2015_D3_K2", articleId: cc_art3.id, clauseNumber: 2, content: "Cá nhân, pháp nhân xác lập, thực hiện, chấm dứt quyền, nghĩa vụ dân sự của mình trên cơ sở tự do, tự nguyện cam kết, thỏa thuận. Mọi cam kết, thỏa thuận không vi phạm điều cấm của luật, không trái đạo đức xã hội có hiệu lực thực hiện đối với các bên và phải được chủ thể khác tôn trọng." },
      { canonicalId: "VN_BLDS_2015_D3_K3", articleId: cc_art3.id, clauseNumber: 3, content: "Cá nhân, pháp nhân phải xác lập, thực hiện, chấm dứt quyền, nghĩa vụ dân sự của mình một cách thiện chí, trung thực." },
      { canonicalId: "VN_BLDS_2015_D3_K4", articleId: cc_art3.id, clauseNumber: 4, content: "Việc xác lập, thực hiện, chấm dứt quyền, nghĩa vụ dân sự không được xâm phạm đến lợi ích quốc gia, dân tộc, lợi ích công cộng, quyền và lợi ích hợp pháp của người khác." },
      { canonicalId: "VN_BLDS_2015_D3_K5", articleId: cc_art3.id, clauseNumber: 5, content: "Cá nhân, pháp nhân phải tự chịu trách nhiệm về việc không thực hiện hoặc thực hiện không đúng nghĩa vụ dân sự." },
    ],
  });

  // ---- Contracts section ----
  const cc_art385 = await prisma.article.create({
    data: {
      canonicalId: "VN_BLDS_2015_D385",
      documentId: civilCode.id,
      articleNumber: 385,
      title: "Khái niệm hợp đồng",
      content: "Hợp đồng là sự thỏa thuận giữa các bên về việc xác lập, thay đổi hoặc chấm dứt quyền, nghĩa vụ dân sự.",
      chapter: "Phần thứ ba - Chương XV",
    },
  });

  const cc_art386 = await prisma.article.create({
    data: {
      canonicalId: "VN_BLDS_2015_D386",
      documentId: civilCode.id,
      articleNumber: 386,
      title: "Đề nghị giao kết hợp đồng",
      content: "Đề nghị giao kết hợp đồng là việc thể hiện rõ ý định giao kết hợp đồng và chịu sự ràng buộc về đề nghị này của bên đề nghị đối với bên được đề nghị.",
      chapter: "Phần thứ ba - Chương XV",
    },
  });

  await prisma.clause.createMany({
    data: [
      { canonicalId: "VN_BLDS_2015_D386_K1", articleId: cc_art386.id, clauseNumber: 1, content: "Đề nghị giao kết hợp đồng là việc thể hiện rõ ý định giao kết hợp đồng và chịu sự ràng buộc về đề nghị này của bên đề nghị đối với bên được đề nghị." },
      { canonicalId: "VN_BLDS_2015_D386_K2", articleId: cc_art386.id, clauseNumber: 2, content: "Trường hợp đề nghị giao kết hợp đồng có nêu rõ thời hạn trả lời, nếu bên đề nghị lại giao kết hợp đồng với người thứ ba trong thời hạn chờ bên được đề nghị trả lời thì phải bồi thường thiệt hại cho bên được đề nghị mà không được giao kết hợp đồng nếu có thiệt hại phát sinh." },
    ],
  });

  const cc_art398 = await prisma.article.create({
    data: {
      canonicalId: "VN_BLDS_2015_D398",
      documentId: civilCode.id,
      articleNumber: 398,
      title: "Nội dung của hợp đồng",
      content: "Các bên trong hợp đồng có quyền thỏa thuận về nội dung trong hợp đồng.",
      chapter: "Phần thứ ba - Chương XV",
    },
  });

  const c398_1 = await prisma.clause.create({
    data: {
      canonicalId: "VN_BLDS_2015_D398_K1",
      articleId: cc_art398.id,
      clauseNumber: 1,
      content: "Các bên trong hợp đồng có quyền thỏa thuận về nội dung trong hợp đồng. Hợp đồng có thể có các nội dung sau đây:",
    },
  });

  await prisma.point.createMany({
    data: [
      { canonicalId: "VN_BLDS_2015_D398_K1_A", clauseId: c398_1.id, pointLetter: "a", content: "Đối tượng của hợp đồng;" },
      { canonicalId: "VN_BLDS_2015_D398_K1_B", clauseId: c398_1.id, pointLetter: "b", content: "Số lượng, chất lượng;" },
      { canonicalId: "VN_BLDS_2015_D398_K1_C", clauseId: c398_1.id, pointLetter: "c", content: "Giá, phương thức thanh toán;" },
      { canonicalId: "VN_BLDS_2015_D398_K1_D", clauseId: c398_1.id, pointLetter: "d", content: "Thời hạn, địa điểm, phương thức thực hiện hợp đồng;" },
      { canonicalId: "VN_BLDS_2015_D398_K1_DD", clauseId: c398_1.id, pointLetter: "e", content: "Quyền, nghĩa vụ của các bên;" },
      { canonicalId: "VN_BLDS_2015_D398_K1_E", clauseId: c398_1.id, pointLetter: "f", content: "Trách nhiệm do vi phạm hợp đồng;" },
      { canonicalId: "VN_BLDS_2015_D398_K1_G", clauseId: c398_1.id, pointLetter: "g", content: "Phương thức giải quyết tranh chấp." },
    ],
  });

  const cc_art407 = await prisma.article.create({
    data: {
      canonicalId: "VN_BLDS_2015_D407",
      documentId: civilCode.id,
      articleNumber: 407,
      title: "Hợp đồng vô hiệu",
      content: "Quy định về giao dịch dân sự vô hiệu từ Điều 123 đến Điều 133 của Bộ luật này cũng được áp dụng đối với hợp đồng vô hiệu.",
      chapter: "Phần thứ ba - Chương XV",
    },
  });

  await prisma.clause.createMany({
    data: [
      { canonicalId: "VN_BLDS_2015_D407_K1", articleId: cc_art407.id, clauseNumber: 1, content: "Quy định về giao dịch dân sự vô hiệu từ Điều 123 đến Điều 133 của Bộ luật này cũng được áp dụng đối với hợp đồng vô hiệu." },
      { canonicalId: "VN_BLDS_2015_D407_K2", articleId: cc_art407.id, clauseNumber: 2, content: "Sự vô hiệu của hợp đồng chính làm chấm dứt hợp đồng phụ, trừ trường hợp các bên có thỏa thuận hợp đồng phụ được thay thế hợp đồng chính. Quy định này không áp dụng đối với biện pháp bảo đảm thực hiện nghĩa vụ." },
      { canonicalId: "VN_BLDS_2015_D407_K3", articleId: cc_art407.id, clauseNumber: 3, content: "Sự vô hiệu của hợp đồng phụ không làm chấm dứt hợp đồng chính, trừ trường hợp các bên thỏa thuận hợp đồng phụ là một phần không thể tách rời của hợp đồng chính." },
    ],
  });

  // ---- Property rights ----
  const cc_art158 = await prisma.article.create({
    data: {
      canonicalId: "VN_BLDS_2015_D158",
      documentId: civilCode.id,
      articleNumber: 158,
      title: "Quyền sở hữu",
      content: "Quyền sở hữu bao gồm quyền chiếm hữu, quyền sử dụng và quyền định đoạt tài sản của chủ sở hữu theo quy định của luật.",
      chapter: "Phần thứ hai - Chương XI",
    },
  });

  const cc_art159 = await prisma.article.create({
    data: {
      canonicalId: "VN_BLDS_2015_D159",
      documentId: civilCode.id,
      articleNumber: 159,
      title: "Quyền khác đối với tài sản",
      content: "Quyền khác đối với tài sản là quyền của chủ thể trực tiếp nắm giữ, chi phối tài sản thuộc quyền sở hữu của chủ thể khác.",
      chapter: "Phần thứ hai - Chương XI",
    },
  });

  await prisma.clause.createMany({
    data: [
      { canonicalId: "VN_BLDS_2015_D159_K1", articleId: cc_art159.id, clauseNumber: 1, content: "Quyền khác đối với tài sản là quyền của chủ thể trực tiếp nắm giữ, chi phối tài sản thuộc quyền sở hữu của chủ thể khác." },
      { canonicalId: "VN_BLDS_2015_D159_K2", articleId: cc_art159.id, clauseNumber: 2, content: "Quyền khác đối với tài sản bao gồm: quyền đối với bất động sản liền kề; quyền hưởng dụng; quyền bề mặt." },
    ],
  });

  // ================================================================
  // DOCUMENT 3: Luật Doanh nghiệp 2020 (Enterprise Law)
  // ================================================================
  const enterpriseLaw = await prisma.legalDocument.create({
    data: {
      canonicalId: "VN_LDN_2020",
      title: "Luật Doanh nghiệp",
      documentNumber: "59/2020/QH14",
      documentType: "luat",
      issuingBody: "Quốc hội",
      issuedDate: new Date("2020-06-17"),
      effectiveDate: new Date("2021-01-01"),
      slug: "luat-doanh-nghiep",
      year: 2020,
      status: "active",
    },
  });

  // ---- CHAPTER I: GENERAL PROVISIONS (Điều 1-8) ----

  const dn_art1 = await prisma.article.create({
    data: {
      canonicalId: "VN_LDN_2020_D1",
      documentId: enterpriseLaw.id,
      articleNumber: 1,
      title: "Phạm vi điều chỉnh",
      content:
        "Luật này quy định về việc thành lập, tổ chức quản lý, tổ chức lại, giải thể và hoạt động có liên quan của doanh nghiệp, bao gồm công ty trách nhiệm hữu hạn, công ty cổ phần, công ty hợp danh và doanh nghiệp tư nhân; quy định về nhóm công ty.",
      chapter: "Chương I",
    },
  });

  const dn_art2 = await prisma.article.create({
    data: {
      canonicalId: "VN_LDN_2020_D2",
      documentId: enterpriseLaw.id,
      articleNumber: 2,
      title: "Đối tượng áp dụng",
      content: "Luật này áp dụng đối với doanh nghiệp và các tổ chức, cá nhân có liên quan đến việc thành lập, tổ chức quản lý, tổ chức lại, giải thể và hoạt động có liên quan của doanh nghiệp.",
      chapter: "Chương I",
    },
  });

  const dn_art3 = await prisma.article.create({
    data: {
      canonicalId: "VN_LDN_2020_D3",
      documentId: enterpriseLaw.id,
      articleNumber: 3,
      title: "Áp dụng Luật Doanh nghiệp và các luật chuyên ngành",
      content: "Trường hợp luật chuyên ngành có quy định đặc thù về việc thành lập, tổ chức quản lý, tổ chức lại, giải thể và hoạt động có liên quan của doanh nghiệp thì áp dụng quy định của luật đó.",
      chapter: "Chương I",
    },
  });

  const dn_art4 = await prisma.article.create({
    data: {
      canonicalId: "VN_LDN_2020_D4",
      documentId: enterpriseLaw.id,
      articleNumber: 4,
      title: "Giải thích từ ngữ",
      content: "Trong Luật này, các từ ngữ dưới đây được hiểu như sau:",
      chapter: "Chương I",
    },
  });

  const dn_c4_1 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LDN_2020_D4_K1",
      articleId: dn_art4.id,
      clauseNumber: 1,
      content:
        "Doanh nghiệp là tổ chức có tên riêng, có tài sản, có trụ sở giao dịch, được thành lập hoặc đăng ký thành lập theo quy định của pháp luật nhằm mục đích kinh doanh.",
    },
  });
  const dn_c4_2 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LDN_2020_D4_K2",
      articleId: dn_art4.id,
      clauseNumber: 2,
      content:
        "Doanh nghiệp nhà nước bao gồm các doanh nghiệp do Nhà nước nắm giữ trên 50% vốn điều lệ, tổng số cổ phần có quyền biểu quyết theo quy định tại Điều 88 của Luật này.",
    },
  });
  const dn_c4_3 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LDN_2020_D4_K3",
      articleId: dn_art4.id,
      clauseNumber: 3,
      content:
        "Doanh nghiệp xã hội là doanh nghiệp được thành lập theo quy định của Luật này, mục tiêu hoạt động nhằm giải quyết vấn đề xã hội, môi trường vì lợi ích cộng đồng, sử dụng ít nhất 51% tổng lợi nhuận sau thuế hằng năm của doanh nghiệp để tái đầu tư nhằm thực hiện mục tiêu đã đăng ký.",
    },
  });
  await prisma.clause.createMany({
    data: [
      {
        canonicalId: "VN_LDN_2020_D4_K4",
        articleId: dn_art4.id,
        clauseNumber: 4,
        content: "Góp vốn là việc góp tài sản để tạo thành vốn điều lệ của công ty, bao gồm góp vốn để thành lập công ty hoặc góp thêm vốn điều lệ của công ty đã được thành lập.",
      },
      {
        canonicalId: "VN_LDN_2020_D4_K5",
        articleId: dn_art4.id,
        clauseNumber: 5,
        content: "Phần vốn góp là tổng giá trị tài sản của một thành viên đã góp hoặc cam kết góp vào công ty trách nhiệm hữu hạn, công ty hợp danh. Tỷ lệ phần vốn góp là tỷ lệ giữa phần vốn góp của một thành viên với vốn điều lệ của công ty trách nhiệm hữu hạn, công ty hợp danh.",
      },
      {
        canonicalId: "VN_LDN_2020_D4_K6",
        articleId: dn_art4.id,
        clauseNumber: 6,
        content: "Cổ phần là phần chia nhỏ nhất vốn điều lệ của công ty cổ phần.",
      },
      {
        canonicalId: "VN_LDN_2020_D4_K7",
        articleId: dn_art4.id,
        clauseNumber: 7,
        content: "Cổ phiếu là chứng chỉ do công ty cổ phần phát hành, bút toán ghi sổ hoặc dữ liệu điện tử xác nhận quyền sở hữu một hoặc một số cổ phần của công ty đó.",
      },
      {
        canonicalId: "VN_LDN_2020_D4_K8",
        articleId: dn_art4.id,
        clauseNumber: 8,
        content: "Cổ đông là cá nhân, tổ chức sở hữu ít nhất một cổ phần của công ty cổ phần.",
      },
    ],
  });

  const dn_art5 = await prisma.article.create({
    data: {
      canonicalId: "VN_LDN_2020_D5",
      documentId: enterpriseLaw.id,
      articleNumber: 5,
      title: "Bảo đảm của Nhà nước đối với doanh nghiệp và chủ sở hữu doanh nghiệp",
      content: "Nhà nước bảo đảm quyền và lợi ích hợp pháp của doanh nghiệp và chủ sở hữu doanh nghiệp:",
      chapter: "Chương I",
    },
  });

  await prisma.clause.createMany({
    data: [
      {
        canonicalId: "VN_LDN_2020_D5_K1",
        articleId: dn_art5.id,
        clauseNumber: 1,
        content: "Nhà nước công nhận và bảo hộ quyền sở hữu tài sản, vốn đầu tư, thu nhập, quyền và lợi ích hợp pháp khác của doanh nghiệp và chủ sở hữu doanh nghiệp.",
      },
      {
        canonicalId: "VN_LDN_2020_D5_K2",
        articleId: dn_art5.id,
        clauseNumber: 2,
        content: "Tài sản và vốn đầu tư hợp pháp của doanh nghiệp và chủ sở hữu doanh nghiệp không bị quốc hữu hóa, không bị tịch thu bằng biện pháp hành chính.",
      },
      {
        canonicalId: "VN_LDN_2020_D5_K3",
        articleId: dn_art5.id,
        clauseNumber: 3,
        content: "Trường hợp cần thiết vì lý do quốc phòng, an ninh hoặc vì lợi ích quốc gia, tình trạng khẩn cấp, phòng, chống thiên tai, Nhà nước trưng mua hoặc trưng dụng có bồi thường tài sản của doanh nghiệp theo giá thị trường tại thời điểm công bố trưng mua hoặc trưng dụng theo quy định của pháp luật về trưng mua, trưng dụng tài sản.",
      },
    ],
  });

  const dn_art7 = await prisma.article.create({
    data: {
      canonicalId: "VN_LDN_2020_D7",
      documentId: enterpriseLaw.id,
      articleNumber: 7,
      title: "Quyền của doanh nghiệp",
      content: "Doanh nghiệp có các quyền sau đây:",
      chapter: "Chương I",
    },
  });

  const dn_c7_1 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LDN_2020_D7_K1",
      articleId: dn_art7.id,
      clauseNumber: 1,
      content: "Tự do kinh doanh ngành, nghề mà luật không cấm.",
    },
  });
  const dn_c7_2 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LDN_2020_D7_K2",
      articleId: dn_art7.id,
      clauseNumber: 2,
      content: "Tự chủ kinh doanh và lựa chọn hình thức tổ chức kinh doanh; chủ động lựa chọn ngành, nghề, địa bàn, hình thức kinh doanh; chủ động điều chỉnh quy mô và ngành, nghề kinh doanh.",
    },
  });
  await prisma.clause.createMany({
    data: [
      {
        canonicalId: "VN_LDN_2020_D7_K3",
        articleId: dn_art7.id,
        clauseNumber: 3,
        content: "Lựa chọn hình thức, phương thức huy động, phân bổ và sử dụng vốn.",
      },
      {
        canonicalId: "VN_LDN_2020_D7_K4",
        articleId: dn_art7.id,
        clauseNumber: 4,
        content: "Tự do tìm kiếm thị trường, khách hàng và ký kết hợp đồng.",
      },
      {
        canonicalId: "VN_LDN_2020_D7_K5",
        articleId: dn_art7.id,
        clauseNumber: 5,
        content: "Kinh doanh xuất khẩu, nhập khẩu.",
      },
      {
        canonicalId: "VN_LDN_2020_D7_K6",
        articleId: dn_art7.id,
        clauseNumber: 6,
        content: "Tuyển dụng, thuê và sử dụng lao động theo quy định của pháp luật về lao động.",
      },
      {
        canonicalId: "VN_LDN_2020_D7_K7",
        articleId: dn_art7.id,
        clauseNumber: 7,
        content: "Chủ động ứng dụng khoa học và công nghệ để nâng cao hiệu quả kinh doanh và khả năng cạnh tranh; được bảo hộ quyền sở hữu trí tuệ theo quy định của pháp luật về sở hữu trí tuệ.",
      },
      {
        canonicalId: "VN_LDN_2020_D7_K8",
        articleId: dn_art7.id,
        clauseNumber: 8,
        content: "Chiếm hữu, sử dụng, định đoạt tài sản của doanh nghiệp.",
      },
    ],
  });

  const dn_art8 = await prisma.article.create({
    data: {
      canonicalId: "VN_LDN_2020_D8",
      documentId: enterpriseLaw.id,
      articleNumber: 8,
      title: "Nghĩa vụ của doanh nghiệp",
      content: "Doanh nghiệp có các nghĩa vụ sau đây:",
      chapter: "Chương I",
    },
  });

  const dn_c8_1 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LDN_2020_D8_K1",
      articleId: dn_art8.id,
      clauseNumber: 1,
      content: "Đáp ứng đủ điều kiện kinh doanh khi kinh doanh ngành, nghề đầu tư kinh doanh có điều kiện; bảo đảm duy trì đủ điều kiện kinh doanh trong suốt quá trình hoạt động kinh doanh.",
    },
  });
  await prisma.clause.createMany({
    data: [
      {
        canonicalId: "VN_LDN_2020_D8_K2",
        articleId: dn_art8.id,
        clauseNumber: 2,
        content: "Tổ chức công tác kế toán, nộp thuế và thực hiện các nghĩa vụ tài chính khác theo quy định của pháp luật.",
      },
      {
        canonicalId: "VN_LDN_2020_D8_K3",
        articleId: dn_art8.id,
        clauseNumber: 3,
        content: "Bảo đảm quyền, lợi ích hợp pháp, chính đáng của người lao động theo quy định của pháp luật về lao động; không phân biệt đối xử, xúc phạm danh dự, nhân phẩm của người lao động trong doanh nghiệp; không ngược đãi lao động, cưỡng bức lao động hoặc sử dụng lao động chưa thành niên trái pháp luật; hỗ trợ và tạo điều kiện thuận lợi cho người lao động tham gia đào tạo nâng cao trình độ, kỹ năng nghề; thực hiện chế độ bảo hiểm xã hội, bảo hiểm thất nghiệp, bảo hiểm y tế và bảo hiểm khác cho người lao động theo quy định của pháp luật.",
      },
      {
        canonicalId: "VN_LDN_2020_D8_K4",
        articleId: dn_art8.id,
        clauseNumber: 4,
        content: "Bảo đảm và chịu trách nhiệm về chất lượng hàng hóa, dịch vụ theo tiêu chuẩn do pháp luật quy định hoặc tiêu chuẩn đã đăng ký hoặc công bố.",
      },
      {
        canonicalId: "VN_LDN_2020_D8_K5",
        articleId: dn_art8.id,
        clauseNumber: 5,
        content: "Thực hiện đầy đủ, kịp thời các nghĩa vụ về đăng ký doanh nghiệp, đăng ký thay đổi nội dung đăng ký doanh nghiệp, công khai thông tin về thành lập và hoạt động, báo cáo và các nghĩa vụ khác theo quy định của Luật này và quy định khác của pháp luật có liên quan.",
      },
      {
        canonicalId: "VN_LDN_2020_D8_K6",
        articleId: dn_art8.id,
        clauseNumber: 6,
        content: "Chịu trách nhiệm về tính trung thực, chính xác của thông tin kê khai trong hồ sơ đăng ký doanh nghiệp và các báo cáo; trường hợp phát hiện thông tin đã kê khai hoặc báo cáo thiếu chính xác, chưa đầy đủ thì phải kịp thời sửa đổi, bổ sung các thông tin đó.",
      },
      {
        canonicalId: "VN_LDN_2020_D8_K7",
        articleId: dn_art8.id,
        clauseNumber: 7,
        content: "Tuân thủ quy định của pháp luật về quốc phòng, an ninh, trật tự, an toàn xã hội, bình đẳng giới, bảo vệ tài nguyên, môi trường, bảo vệ di tích lịch sử - văn hóa và danh lam thắng cảnh.",
      },
    ],
  });

  // ---- CHAPTER II: ESTABLISHMENT (Điều 16, 17) ----

  const dn_art16 = await prisma.article.create({
    data: {
      canonicalId: "VN_LDN_2020_D16",
      documentId: enterpriseLaw.id,
      articleNumber: 16,
      title: "Quyền thành lập, góp vốn, mua cổ phần, mua phần vốn góp và quản lý doanh nghiệp",
      content: "Tổ chức, cá nhân có quyền thành lập và quản lý doanh nghiệp tại Việt Nam theo quy định của Luật này, trừ trường hợp quy định tại khoản 2 Điều này.",
      chapter: "Chương II",
    },
  });

  await prisma.clause.createMany({
    data: [
      {
        canonicalId: "VN_LDN_2020_D16_K1",
        articleId: dn_art16.id,
        clauseNumber: 1,
        content: "Tổ chức, cá nhân có quyền thành lập và quản lý doanh nghiệp tại Việt Nam theo quy định của Luật này, trừ trường hợp quy định tại khoản 2 Điều này.",
      },
      {
        canonicalId: "VN_LDN_2020_D16_K2",
        articleId: dn_art16.id,
        clauseNumber: 2,
        content: "Tổ chức, cá nhân sau đây không có quyền thành lập và quản lý doanh nghiệp tại Việt Nam:",
      },
      {
        canonicalId: "VN_LDN_2020_D16_K3",
        articleId: dn_art16.id,
        clauseNumber: 3,
        content: "Tổ chức, cá nhân có quyền góp vốn, mua cổ phần, mua phần vốn góp vào công ty cổ phần, công ty trách nhiệm hữu hạn, công ty hợp danh theo quy định của Luật này, trừ trường hợp quy định tại khoản 4 Điều này.",
      },
    ],
  });

  const dn_c16_2 = await prisma.clause.findFirst({
    where: { canonicalId: "VN_LDN_2020_D16_K2" },
  });

  await prisma.point.createMany({
    data: [
      { canonicalId: "VN_LDN_2020_D16_K2_A", clauseId: dn_c16_2!.id, pointLetter: "a", content: "Cơ quan nhà nước, đơn vị lực lượng vũ trang nhân dân sử dụng tài sản nhà nước để thành lập doanh nghiệp kinh doanh thu lợi riêng cho cơ quan, đơn vị mình;" },
      { canonicalId: "VN_LDN_2020_D16_K2_B", clauseId: dn_c16_2!.id, pointLetter: "b", content: "Cán bộ, công chức, viên chức theo quy định của Luật Cán bộ, công chức và Luật Viên chức;" },
      { canonicalId: "VN_LDN_2020_D16_K2_C", clauseId: dn_c16_2!.id, pointLetter: "c", content: "Sĩ quan, hạ sĩ quan, quân nhân chuyên nghiệp, công nhân, viên chức quốc phòng trong các cơ quan, đơn vị thuộc Quân đội nhân dân Việt Nam; sĩ quan, hạ sĩ quan chuyên nghiệp, công nhân công an trong các cơ quan, đơn vị thuộc Công an nhân dân Việt Nam, trừ người được cử làm đại diện theo ủy quyền để quản lý phần vốn góp của Nhà nước tại doanh nghiệp hoặc quản lý tại doanh nghiệp nhà nước;" },
      { canonicalId: "VN_LDN_2020_D16_K2_D", clauseId: dn_c16_2!.id, pointLetter: "d", content: "Cán bộ lãnh đạo, quản lý nghiệp vụ trong doanh nghiệp nhà nước theo quy định tại điểm a khoản 1 Điều 88 của Luật này, trừ người được cử làm đại diện theo ủy quyền để quản lý phần vốn góp của Nhà nước tại doanh nghiệp khác;" },
      { canonicalId: "VN_LDN_2020_D16_K2_DD", clauseId: dn_c16_2!.id, pointLetter: "e", content: "Người chưa thành niên; người bị hạn chế năng lực hành vi dân sự; người bị mất năng lực hành vi dân sự; người có khó khăn trong nhận thức, làm chủ hành vi; tổ chức không có tư cách pháp nhân;" },
      { canonicalId: "VN_LDN_2020_D16_K2_E", clauseId: dn_c16_2!.id, pointLetter: "f", content: "Người đang bị truy cứu trách nhiệm hình sự, bị tạm giam, đang chấp hành hình phạt tù, đang chấp hành biện pháp xử lý hành chính tại cơ sở cai nghiện bắt buộc, cơ sở giáo dục bắt buộc hoặc đang bị Tòa án cấm đảm nhiệm chức vụ, cấm hành nghề hoặc làm công việc nhất định; các trường hợp khác theo quy định của Luật Phá sản, Luật Phòng, chống tham nhũng." },
    ],
  });

  const dn_art17 = await prisma.article.create({
    data: {
      canonicalId: "VN_LDN_2020_D17",
      documentId: enterpriseLaw.id,
      articleNumber: 17,
      title: "Hồ sơ đăng ký doanh nghiệp",
      content: "Hồ sơ đăng ký doanh nghiệp bao gồm các giấy tờ sau đây:",
      chapter: "Chương II",
    },
  });

  await prisma.clause.createMany({
    data: [
      {
        canonicalId: "VN_LDN_2020_D17_K1",
        articleId: dn_art17.id,
        clauseNumber: 1,
        content: "Giấy đề nghị đăng ký doanh nghiệp.",
      },
      {
        canonicalId: "VN_LDN_2020_D17_K2",
        articleId: dn_art17.id,
        clauseNumber: 2,
        content: "Điều lệ công ty.",
      },
      {
        canonicalId: "VN_LDN_2020_D17_K3",
        articleId: dn_art17.id,
        clauseNumber: 3,
        content: "Danh sách thành viên đối với công ty trách nhiệm hữu hạn, danh sách cổ đông sáng lập đối với công ty cổ phần, danh sách thành viên hợp danh đối với công ty hợp danh.",
      },
      {
        canonicalId: "VN_LDN_2020_D17_K4",
        articleId: dn_art17.id,
        clauseNumber: 4,
        content: "Bản sao các giấy tờ sau đây: giấy tờ pháp lý của cá nhân đối với người đại diện theo pháp luật của doanh nghiệp; giấy tờ pháp lý của cá nhân đối với thành viên công ty, cổ đông sáng lập, cổ đông là nhà đầu tư nước ngoài là cá nhân; giấy tờ pháp lý của tổ chức đối với thành viên, cổ đông sáng lập, cổ đông là nhà đầu tư nước ngoài là tổ chức; giấy tờ pháp lý của cá nhân đối với người đại diện theo ủy quyền và văn bản cử người đại diện theo ủy quyền.",
      },
      {
        canonicalId: "VN_LDN_2020_D17_K5",
        articleId: dn_art17.id,
        clauseNumber: 5,
        content: "Đối với doanh nghiệp được thành lập trên cơ sở chuyển đổi, hồ sơ đăng ký doanh nghiệp bao gồm các giấy tờ quy định tại các khoản 1, 2, 3 và 4 Điều này và bản sao quyết định chuyển đổi hoặc bản sao hợp đồng chuyển nhượng hoặc giấy tờ khác chứng minh việc chuyển đổi.",
      },
    ],
  });

  // ---- CHAPTER V: LLC (Điều 46, 47, 50) ----

  const dn_art46 = await prisma.article.create({
    data: {
      canonicalId: "VN_LDN_2020_D46",
      documentId: enterpriseLaw.id,
      articleNumber: 46,
      title: "Công ty trách nhiệm hữu hạn hai thành viên trở lên",
      content: "Công ty trách nhiệm hữu hạn hai thành viên trở lên là doanh nghiệp có đặc điểm sau đây:",
      chapter: "Chương III",
    },
  });

  await prisma.clause.createMany({
    data: [
      {
        canonicalId: "VN_LDN_2020_D46_K1",
        articleId: dn_art46.id,
        clauseNumber: 1,
        content: "Thành viên có thể là tổ chức, cá nhân; số lượng thành viên không vượt quá 50.",
      },
      {
        canonicalId: "VN_LDN_2020_D46_K2",
        articleId: dn_art46.id,
        clauseNumber: 2,
        content: "Thành viên chịu trách nhiệm về các khoản nợ và nghĩa vụ tài sản khác của doanh nghiệp trong phạm vi số vốn đã góp vào doanh nghiệp, trừ trường hợp quy định tại khoản 4 Điều 47 của Luật này.",
      },
      {
        canonicalId: "VN_LDN_2020_D46_K3",
        articleId: dn_art46.id,
        clauseNumber: 3,
        content: "Phần vốn góp của thành viên chỉ được chuyển nhượng theo quy định tại các điều 51, 52 và 53 của Luật này.",
      },
    ],
  });

  const dn_art47 = await prisma.article.create({
    data: {
      canonicalId: "VN_LDN_2020_D47",
      documentId: enterpriseLaw.id,
      articleNumber: 47,
      title: "Thực hiện góp vốn thành lập công ty và cấp giấy chứng nhận phần vốn góp",
      content: "Vốn điều lệ của công ty trách nhiệm hữu hạn hai thành viên trở lên khi đăng ký thành lập doanh nghiệp là tổng giá trị phần vốn góp của các thành viên cam kết góp và ghi trong Điều lệ công ty.",
      chapter: "Chương III",
    },
  });

  await prisma.clause.createMany({
    data: [
      {
        canonicalId: "VN_LDN_2020_D47_K1",
        articleId: dn_art47.id,
        clauseNumber: 1,
        content: "Vốn điều lệ của công ty trách nhiệm hữu hạn hai thành viên trở lên khi đăng ký thành lập doanh nghiệp là tổng giá trị phần vốn góp của các thành viên cam kết góp và ghi trong Điều lệ công ty.",
      },
      {
        canonicalId: "VN_LDN_2020_D47_K2",
        articleId: dn_art47.id,
        clauseNumber: 2,
        content: "Thành viên phải góp vốn cho công ty đủ và đúng loại tài sản đã cam kết khi đăng ký thành lập doanh nghiệp trong thời hạn 90 ngày kể từ ngày được cấp Giấy chứng nhận đăng ký doanh nghiệp, không kể thời gian vận chuyển, nhập khẩu tài sản góp vốn, thực hiện thủ tục hành chính để chuyển quyền sở hữu tài sản. Trong thời hạn này, thành viên có các quyền và nghĩa vụ tương ứng với tỷ lệ phần vốn góp đã cam kết.",
      },
      {
        canonicalId: "VN_LDN_2020_D47_K3",
        articleId: dn_art47.id,
        clauseNumber: 3,
        content: "Trường hợp có thành viên chưa góp vốn hoặc chưa góp đủ số vốn đã cam kết, công ty phải đăng ký thay đổi vốn điều lệ, tỷ lệ phần vốn góp của các thành viên bằng số vốn đã góp trong thời hạn 30 ngày kể từ ngày cuối cùng phải góp đủ phần vốn góp theo quy định tại khoản 2 Điều này.",
      },
      {
        canonicalId: "VN_LDN_2020_D47_K4",
        articleId: dn_art47.id,
        clauseNumber: 4,
        content: "Trường hợp có thành viên chưa góp vốn hoặc chưa góp đủ số vốn đã cam kết, thành viên đó phải chịu trách nhiệm tương ứng với tỷ lệ phần vốn góp đã cam kết đối với các nghĩa vụ tài chính của công ty phát sinh trong thời gian trước ngày công ty đăng ký thay đổi vốn điều lệ và tỷ lệ phần vốn góp của thành viên.",
      },
    ],
  });

  // ---- CHAPTER IV: JSC (Điều 111) ----

  const dn_art111 = await prisma.article.create({
    data: {
      canonicalId: "VN_LDN_2020_D111",
      documentId: enterpriseLaw.id,
      articleNumber: 111,
      title: "Công ty cổ phần",
      content: "Công ty cổ phần là doanh nghiệp có các đặc điểm sau đây:",
      chapter: "Chương V",
    },
  });

  const dn_c111_1 = await prisma.clause.create({
    data: {
      canonicalId: "VN_LDN_2020_D111_K1",
      articleId: dn_art111.id,
      clauseNumber: 1,
      content: "Công ty cổ phần là doanh nghiệp, trong đó:",
    },
  });

  await prisma.point.createMany({
    data: [
      { canonicalId: "VN_LDN_2020_D111_K1_A", clauseId: dn_c111_1.id, pointLetter: "a", content: "Vốn điều lệ được chia thành nhiều phần bằng nhau gọi là cổ phần;" },
      { canonicalId: "VN_LDN_2020_D111_K1_B", clauseId: dn_c111_1.id, pointLetter: "b", content: "Cổ đông có thể là tổ chức, cá nhân; số lượng cổ đông tối thiểu là 03 và không hạn chế số lượng tối đa;" },
      { canonicalId: "VN_LDN_2020_D111_K1_C", clauseId: dn_c111_1.id, pointLetter: "c", content: "Cổ đông chỉ chịu trách nhiệm về các khoản nợ và nghĩa vụ tài sản khác của doanh nghiệp trong phạm vi số vốn đã góp vào doanh nghiệp;" },
      { canonicalId: "VN_LDN_2020_D111_K1_D", clauseId: dn_c111_1.id, pointLetter: "d", content: "Cổ đông có quyền tự do chuyển nhượng cổ phần của mình cho người khác, trừ trường hợp quy định tại khoản 3 Điều 120 và khoản 1 Điều 127 của Luật này." },
    ],
  });

  await prisma.clause.createMany({
    data: [
      {
        canonicalId: "VN_LDN_2020_D111_K2",
        articleId: dn_art111.id,
        clauseNumber: 2,
        content: "Công ty cổ phần có tư cách pháp nhân kể từ ngày được cấp Giấy chứng nhận đăng ký doanh nghiệp.",
      },
      {
        canonicalId: "VN_LDN_2020_D111_K3",
        articleId: dn_art111.id,
        clauseNumber: 3,
        content: "Công ty cổ phần có quyền phát hành cổ phần, trái phiếu và các loại chứng khoán khác của công ty.",
      },
    ],
  });

  // ================================================================
  // RELATIONSHIPS
  // ================================================================
  await prisma.legalRelationship.createMany({
    data: [
      // Labor Code internal relationships
      { sourceType: "article", sourceCanonicalId: "VN_LLD_2019_D35", targetType: "article", targetCanonicalId: "VN_LLD_2019_D36", relationshipType: "related_to", description: "Quyền đơn phương chấm dứt HĐLĐ: NLĐ (Đ.35) và NSDLĐ (Đ.36)" },
      { sourceType: "article", sourceCanonicalId: "VN_LLD_2019_D36", targetType: "article", targetCanonicalId: "VN_LLD_2019_D37", relationshipType: "references", description: "Đ.36 tham chiếu các trường hợp hạn chế tại Đ.37" },
      { sourceType: "article", sourceCanonicalId: "VN_LLD_2019_D39", targetType: "article", targetCanonicalId: "VN_LLD_2019_D35", relationshipType: "references", description: "Đ.39 định nghĩa vi phạm dựa trên Đ.35" },
      { sourceType: "article", sourceCanonicalId: "VN_LLD_2019_D39", targetType: "article", targetCanonicalId: "VN_LLD_2019_D36", relationshipType: "references", description: "Đ.39 định nghĩa vi phạm dựa trên Đ.36" },
      { sourceType: "article", sourceCanonicalId: "VN_LLD_2019_D39", targetType: "article", targetCanonicalId: "VN_LLD_2019_D37", relationshipType: "references", description: "Đ.39 định nghĩa vi phạm dựa trên Đ.37" },
      { sourceType: "article", sourceCanonicalId: "VN_LLD_2019_D40", targetType: "article", targetCanonicalId: "VN_LLD_2019_D39", relationshipType: "related_to", description: "Nghĩa vụ NLĐ khi chấm dứt trái pháp luật (Đ.39)" },
      { sourceType: "article", sourceCanonicalId: "VN_LLD_2019_D41", targetType: "article", targetCanonicalId: "VN_LLD_2019_D39", relationshipType: "related_to", description: "Nghĩa vụ NSDLĐ khi chấm dứt trái pháp luật (Đ.39)" },
      { sourceType: "article", sourceCanonicalId: "VN_LLD_2019_D34", targetType: "article", targetCanonicalId: "VN_LLD_2019_D35", relationshipType: "references", description: "Khoản 9 Đ.34 tham chiếu Đ.35" },
      { sourceType: "article", sourceCanonicalId: "VN_LLD_2019_D34", targetType: "article", targetCanonicalId: "VN_LLD_2019_D36", relationshipType: "references", description: "Khoản 10 Đ.34 tham chiếu Đ.36" },
      { sourceType: "article", sourceCanonicalId: "VN_LLD_2019_D5", targetType: "article", targetCanonicalId: "VN_LLD_2019_D35", relationshipType: "references", description: "Quyền đơn phương chấm dứt HĐLĐ (Đ.5 khoản 1 điểm đ)" },
      // Cross-document relationships
      { sourceType: "document", sourceCanonicalId: "VN_BLDS_2015", targetType: "document", targetCanonicalId: "VN_LLD_2019", relationshipType: "related_to", description: "BLDS quy định nguyên tắc chung về hợp đồng, BLLĐ quy định hợp đồng lao động cụ thể" },
      { sourceType: "article", sourceCanonicalId: "VN_BLDS_2015_D385", targetType: "article", targetCanonicalId: "VN_LLD_2019_D34", relationshipType: "related_to", description: "Khái niệm hợp đồng (BLDS Đ.385) liên quan đến chấm dứt HĐLĐ (BLLĐ Đ.34)" },
      // Enterprise Law relationships
      { sourceType: "article", sourceCanonicalId: "VN_LDN_2020_D7", targetType: "article", targetCanonicalId: "VN_LDN_2020_D8", relationshipType: "related_to", description: "Quyền (Đ.7) và nghĩa vụ (Đ.8) của doanh nghiệp" },
      { sourceType: "article", sourceCanonicalId: "VN_LDN_2020_D46", targetType: "article", targetCanonicalId: "VN_LDN_2020_D47", relationshipType: "related_to", description: "Đặc điểm (Đ.46) và thực hiện góp vốn (Đ.47) công ty TNHH" },
      { sourceType: "article", sourceCanonicalId: "VN_LDN_2020_D8", targetType: "article", targetCanonicalId: "VN_LLD_2019_D6", relationshipType: "references", description: "Nghĩa vụ DN bảo đảm quyền NLĐ (LDN Đ.8) tham chiếu nghĩa vụ NSDLĐ (BLLĐ Đ.6)" },
      { sourceType: "article", sourceCanonicalId: "VN_LDN_2020_D5", targetType: "article", targetCanonicalId: "VN_BLDS_2015_D158", relationshipType: "related_to", description: "Bảo đảm quyền sở hữu tài sản DN (LDN Đ.5) liên quan quyền sở hữu (BLDS Đ.158)" },
    ],
  });

  // ================================================================
  // METADATA
  // ================================================================
  await prisma.legalMetadata.createMany({
    data: [
      { entityType: "document", entityCanonicalId: "VN_LLD_2019", key: "gazette_number", value: "Công báo số 1243-1244" },
      { entityType: "document", entityCanonicalId: "VN_LLD_2019", key: "total_articles", value: "220" },
      { entityType: "document", entityCanonicalId: "VN_LLD_2019", key: "total_chapters", value: "17" },
      { entityType: "article", entityCanonicalId: "VN_LLD_2019_D35", key: "topic", value: "Quyền đơn phương chấm dứt HĐLĐ" },
      { entityType: "article", entityCanonicalId: "VN_LLD_2019_D35", key: "keywords", value: "đơn phương, chấm dứt, hợp đồng lao động, người lao động, báo trước" },
      { entityType: "document", entityCanonicalId: "VN_BLDS_2015", key: "gazette_number", value: "Công báo số 1257-1258" },
      { entityType: "document", entityCanonicalId: "VN_BLDS_2015", key: "total_articles", value: "689" },
      { entityType: "document", entityCanonicalId: "VN_BLDS_2015", key: "total_chapters", value: "6 phần, 27 chương" },
      { entityType: "article", entityCanonicalId: "VN_BLDS_2015_D385", key: "keywords", value: "hợp đồng, thỏa thuận, quyền, nghĩa vụ, dân sự" },
      { entityType: "document", entityCanonicalId: "VN_LDN_2020", key: "gazette_number", value: "Công báo số 757-758" },
      { entityType: "document", entityCanonicalId: "VN_LDN_2020", key: "total_articles", value: "218" },
      { entityType: "document", entityCanonicalId: "VN_LDN_2020", key: "total_chapters", value: "10" },
      { entityType: "article", entityCanonicalId: "VN_LDN_2020_D111", key: "keywords", value: "công ty cổ phần, cổ phần, cổ đông, vốn điều lệ, chứng khoán" },
    ],
  });

  // Count results
  const docCount = await prisma.legalDocument.count();
  const artCount = await prisma.article.count();
  const clauseCount = await prisma.clause.count();
  const pointCount = await prisma.point.count();

  console.log("Seed completed successfully!");
  console.log(`Documents: ${docCount}`);
  console.log(`Articles: ${artCount}`);
  console.log(`Clauses: ${clauseCount}`);
  console.log(`Points: ${pointCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
