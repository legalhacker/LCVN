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
