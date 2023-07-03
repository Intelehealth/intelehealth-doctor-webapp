import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-aid-assessment',
  templateUrl: './aid-assessment.component.html',
  styleUrls: ['./aid-assessment.component.css']
})
export class AidAssessmentComponent implements OnInit {

  surveyOfAcuteHomecare: any = [
    {
      uuid: '1624bf06-1b32-4c46-b8e4-5f2705f05ae2',
      name: 'The main complaint'
    },
    {
      uuid: 'faa6c516-768c-416d-8d99-205b4635f952',
      name: 'Nature of illness'
    },
    {
      uuid: 'f07d5d36-4ea5-4482-9cf1-eb81e687a110',
      name: 'Consciousness'
    },
    {
      uuid: '123739f2-e8a7-49b3-a359-f593674d1cd4',
      name: 'The severity of the symptoms'
    },
    {
      uuid: '1a2d3805-b18c-46de-94a5-002be03b4563',
      name: 'What was the previous diagnosis?'
    },
    {
      uuid: '544b70a7-1c6f-4df1-b4cc-189687dc58dc',
      name: 'Do you have any measurement of vital signs at home (heat, blood pressure, heartbeat, breathing rate, blood -blood rate, blood sugar rate?)'
    },
    {
      uuid: '1ea9f353-90a0-4ef4-9a4f-7c5611fa7671',
      name: 'blood pressure'
    },
    {
      uuid: '37bd5e49-af5a-429f-8903-b6c911f66987',
      name: 'Heartbeat'
    },
    {
      uuid: '06e0eea4-7e20-4305-8808-df4986bf750f',
      name: 'Breathing'
    },
    {
      uuid: '340ed07f-39fa-4a06-bb62-8d897090fd43',
      name: 'Examination'
    },
    {
      uuid: '1efe9ad5-c371-4368-8a74-c1c35836ae0a',
      name: 'Blood sugar'
    },
    {
      uuid: '70665949-6777-411f-9d4a-b10a5e4a6643',
      name: 'Do you have the means to get to a hospital, a health center, or a doctor office in the next 30 minutes?'
    },
    {
      uuid: '329f6bde-8548-4f66-8ef9-f7aa113bf694',
      name: 'Initial diagnosis'
    },
    {
      uuid: '52be4085-118d-4979-a97b-c6af005fa6e8',
      name: 'Recommendation'
    },
  ];

  medicalEmergencyNeed: any = [
    {
      uuid: 'bc530c84-4287-4b9f-a9a8-8bc88e91beb3',
      name: 'Family Book ID Number',
      category: 'General Information'
    },
    {
      uuid: 'ef433cb4-51af-447a-8eca-68cd972cb779',
      name: 'Employment status',
      category: 'General Information'
    },
    {
      uuid: '68bd8d2d-3730-41c2-8ddf-b1a097552727',
      name: 'family situation',
      category: 'General Information'
    },
    {
      uuid: '282d361f-b171-48c4-9cbd-d513eee2d6e7',
      name: 'The family relationship with the household members you support (there can be many options)',
      category: 'General Information'
    },

    {
      uuid: '0b4d4d15-e2b6-43ab-9fe4-b51b8a2835fd',
      name: 'What is the average monthly material needs of your family?',
      category: 'Economic Evaluation'
    },
    {
      uuid: '843738b6-957b-4782-9589-6ff5ee760147',
      name: 'rent',
      category: 'Economic Evaluation'
    },
    {
      uuid: '62ed8a06-817c-483e-bfe1-202a87e00352',
      name: 'Number of family members residing in the same dwelling',
      category: 'Economic Evaluation'
    },
    {
      uuid: '86aacd5a-a6de-4729-823b-3a9ae2fcc8b1',
      name: 'School students',
      category: 'Economic Evaluation'
    },
    {
      uuid: '135252fa-8d5c-4790-a181-94048e785546',
      name: 'What is the number of students in the year of middle school?',
      category: 'Economic Evaluation'
    },
    {
      uuid: '27212fdb-3877-4637-8732-116e646d5271',
      name: 'What is the number of students in the secondary school year?',
      category: 'Economic Evaluation'
    },
    {
      uuid: '3a22a42e-2ee0-4b0d-a04f-9cdd12757516',
      name: 'University students',
      category: 'Economic Evaluation'
    },
    {
      uuid: '184a4450-b548-4244-879e-f9b96a0f6094',
      name: 'people with special needs',
      category: 'Economic Evaluation'
    },
    {
      uuid: '528b2506-b0a0-4b6b-8024-d1c9a581d504',
      name: 'Seniors (over 65)',
      category: 'Economic Evaluation'
    },
    {
      uuid: '073b8171-5b12-40f4-a7ae-530ecddd61b6',
      name: 'Common chronic diseases (heart disease, pressure, diabetes, fat, joints)',
      category: 'Economic Evaluation'
    },
    {
      uuid: 'a195b227-96e8-4a06-8cca-e0fefb80086d',
      name: 'rare diseases',
      category: 'Economic Evaluation'
    },
    {
      uuid: '1bedb639-3bc9-48c5-8664-60f992d29939',
      name: 'average monthly income',
      category: 'Income Resources'
    },
    {
      uuid: '32bbe7ab-e79e-421d-bd00-141e08958b0d',
      name: 'Expatriate remittances',
      category: 'Income Resources'
    },
    {
      uuid: 'ae9e689e-8e23-4edb-a2fc-a9b9a3760922',
      name: 'Financial aid',
      category: 'Income Resources'
    },
    {
      uuid: '63d7fbab-1c6e-4adf-ba98-d4f188b724d7',
      name: 'Diagnosis',
      category: 'Questions for ambulance medical aid'
    },
    {
      uuid: '03723d42-2297-4c6b-92ab-32c40340c37c',
      name: 'Physician',
      category: 'Questions for ambulance medical aid'
    },
    {
      uuid: 'a797eec5-2668-4b98-b830-676c048025e3',
      name: 'The phone number of the attending physician',
      category: 'Questions for ambulance medical aid'
    }
  ];

  generalFamilyNeed: any = [
    {
      uuid: 'bc530c84-4287-4b9f-a9a8-8bc88e91beb3',
      name: 'Family Book ID Number',
      category: 'General Information'
    },
    {
      uuid: '1c718819-345c-4368-aad6-d69b4c267db7',
      name: 'educational attainment level',
      category: 'General Information'
    },
    {
      uuid: 'ef433cb4-51af-447a-8eca-68cd972cb779',
      name: 'Employment status',
      category: 'General Information'
    },
    {
      uuid: '68bd8d2d-3730-41c2-8ddf-b1a097552727',
      name: 'family situation',
      category: 'General Information'
    },
    {
      uuid: '282d361f-b171-48c4-9cbd-d513eee2d6e7',
      name: 'The family relationship with the household members you support (there can be many options)',
      category: 'General Information'
    },
    {
      uuid: 'ff9fea3f-6969-4d82-a4bd-20bbeda8bb94',
      name: 'Do you have an independent residence ?',
      category: 'General Information'
    },
    {
      uuid: '5c203615-e6da-402b-a76f-9b23ed7bb49d',
      name: 'Are you the main responsible for providing for yourself and your family?',
      category: 'General Information'
    },
    {
      uuid: 'e5a3881c-02aa-465d-b1f4-1134b3da8350',
      name: 'Excluding aid, what is the percentage of income that you provide in relation to the total income of the family?',
      category: 'General Information'
    },
    {
      uuid: 'f0607c2b-d811-42cf-92fb-167cb7394add',
      name: 'What made you the main breadwinner in your family?',
      category: 'General Information'
    },
    {
      uuid: '71246db1-53f7-4e65-a5a0-5518d9d41fce',
      name: 'Since when have you been the main responsible for supporting your family?',
      category: 'General Information'
    },
    {
      uuid: '24ff85de-fbd5-4c19-a6a0-32f67b667dd1',
      name: 'Did your status as the main breasdwinner in the family changes recently?',
      category: 'General Information'
    },
    {
      uuid: '9000d613-e962-40a7-af97-754ffeda7d25',
      name: 'What is the reason for the change in your status as the main breadwinner?',
      category: 'General Information'
    },
    {
      uuid: 'fc6d7b70-a663-49c0-85b9-64e8176e5f5e',
      name: 'Since when did this change happen? (Years)',
      category: 'General Information'
    },
    {
      uuid: '0b4d4d15-e2b6-43ab-9fe4-b51b8a2835fd',
      name: 'What is the average monthly material needs of your family?',
      category: 'Economic Evaluation'
    },
    {
      uuid: '843738b6-957b-4782-9589-6ff5ee760147',
      name: 'rent',
      category: 'Economic Evaluation'
    },
    {
      uuid: '62ed8a06-817c-483e-bfe1-202a87e00352',
      name: 'Number of family members residing in the same dwelling',
      category: 'Economic Evaluation'
    },
    {
      uuid: '86aacd5a-a6de-4729-823b-3a9ae2fcc8b1',
      name: 'School students',
      category: 'Economic Evaluation'
    },
    {
      uuid: '135252fa-8d5c-4790-a181-94048e785546',
      name: 'What is the number of students in the year of middle school?',
      category: 'Economic Evaluation'
    },
    {
      uuid: '27212fdb-3877-4637-8732-116e646d5271',
      name: 'What is the number of students in the secondary school year?',
      category: 'Economic Evaluation'
    },
    {
      uuid: '3a22a42e-2ee0-4b0d-a04f-9cdd12757516',
      name: 'University students',
      category: 'Economic Evaluation'
    },
    {
      uuid: '184a4450-b548-4244-879e-f9b96a0f6094',
      name: 'people with special needs',
      category: 'Economic Evaluation'
    },
    {
      uuid: '528b2506-b0a0-4b6b-8024-d1c9a581d504',
      name: 'Seniors (over 65)',
      category: 'Economic Evaluation'
    },
    {
      uuid: '073b8171-5b12-40f4-a7ae-530ecddd61b6',
      name: 'Common chronic diseases (heart disease, pressure, diabetes, fat, joints)',
      category: 'Economic Evaluation'
    },
    {
      uuid: 'a195b227-96e8-4a06-8cca-e0fefb80086d',
      name: 'rare diseases',
      category: 'Economic Evaluation'
    },
    {
      uuid: '1bedb639-3bc9-48c5-8664-60f992d29939',
      name: 'average monthly income',
      category: 'Income Resources'
    },
    {
      uuid: 'b7cba674-5db2-4c8e-9747-1a60b107e34c',
      name: 'source of income',
      category: 'Income Resources'
    },
    {
      uuid: '53039c5f-f195-442e-8997-3c929a490e63',
      name: 'job salary',
      category: 'Income Resources'
    },
    {
      uuid: '34abd795-10ff-4af1-ab88-3a1dc4c0d108',
      name: 'What is the average monthly income from a job salary in the private sector?',
      category: 'Income Resources'
    },
    {
      uuid: '0a6adec4-305f-495a-8d8e-734ef56fb06f',
      name: 'What is the average monthly income of home-based manufacturing (food industries, clothes, etc.) (net profit)?',
      category: 'Income Resources'
    },
    {
      uuid: 'e67413a6-0419-48fc-8060-fbf0f912e52e',
      name: 'business income',
      category: 'Income Resources'
    },
    {
      uuid: 'ebef76fc-431e-4ab3-bac6-14e52d2d0c34',
      name: 'agricultural business income',
      category: 'Income Resources'
    },
    {
      uuid: '32bbe7ab-e79e-421d-bd00-141e08958b0d',
      name: 'Expatriate remittances',
      category: 'Income Resources'
    },
    {
      uuid: 'd55c52b7-8791-4542-ad40-8134f971da8f',
      name: 'Place of residence of the remittance sender',
      category: 'Income Resources'
    },
    {
      uuid: 'ae9e689e-8e23-4edb-a2fc-a9b9a3760922',
      name: 'Financial aid',
      category: 'Income Resources'
    }
  ];

  studentNeed: any = [
    {
      uuid: 'bc530c84-4287-4b9f-a9a8-8bc88e91beb3',
      name: 'Family Book ID Number',
      category: 'General Information'
    },
    {
      uuid: '1c718819-345c-4368-aad6-d69b4c267db7',
      name: 'educational attainment level',
      category: 'General Information'
    },
    {
      uuid: 'ef433cb4-51af-447a-8eca-68cd972cb779',
      name: 'Employment status',
      category: 'General Information'
    },
    {
      uuid: '68bd8d2d-3730-41c2-8ddf-b1a097552727',
      name: 'family situation',
      category: 'General Information'
    },
    {
      uuid: '282d361f-b171-48c4-9cbd-d513eee2d6e7',
      name: 'The family relationship with the household members you support (there can be many options)',
      category: 'General Information'
    },
    {
      uuid: '0b4d4d15-e2b6-43ab-9fe4-b51b8a2835fd',
      name: 'What is the average monthly material needs of your family?',
      category: 'Economic Evaluation'
    },
    {
      uuid: '843738b6-957b-4782-9589-6ff5ee760147',
      name: 'rent',
      category: 'Economic Evaluation'
    },
    {
      uuid: '62ed8a06-817c-483e-bfe1-202a87e00352',
      name: 'Number of family members residing in the same dwelling',
      category: 'Economic Evaluation'
    },
    {
      uuid: '86aacd5a-a6de-4729-823b-3a9ae2fcc8b1',
      name: 'School students',
      category: 'Economic Evaluation'
    },
    {
      uuid: '135252fa-8d5c-4790-a181-94048e785546',
      name: 'What is the number of students in the year of middle school?',
      category: 'Economic Evaluation'
    },
    {
      uuid: '27212fdb-3877-4637-8732-116e646d5271',
      name: 'What is the number of students in the secondary school year?',
      category: 'Economic Evaluation'
    },
    {
      uuid: '3a22a42e-2ee0-4b0d-a04f-9cdd12757516',
      name: 'University students',
      category: 'Economic Evaluation'
    },
    {
      uuid: '184a4450-b548-4244-879e-f9b96a0f6094',
      name: 'people with special needs',
      category: 'Economic Evaluation'
    },
    {
      uuid: '528b2506-b0a0-4b6b-8024-d1c9a581d504',
      name: 'Seniors (over 65)',
      category: 'Economic Evaluation'
    },
    {
      uuid: '073b8171-5b12-40f4-a7ae-530ecddd61b6',
      name: 'Common chronic diseases (heart disease, pressure, diabetes, fat, joints)',
      category: 'Economic Evaluation'
    },
    {
      uuid: 'a195b227-96e8-4a06-8cca-e0fefb80086d',
      name: 'rare diseases',
      category: 'Economic Evaluation'
    },
    {
      uuid: '1bedb639-3bc9-48c5-8664-60f992d29939',
      name: 'average monthly income',
      category: 'Income Resources'
    },
    {
      uuid: '32bbe7ab-e79e-421d-bd00-141e08958b0d',
      name: 'Expatriate remittances',
      category: 'Income Resources'
    },
    {
      uuid: 'ae9e689e-8e23-4edb-a2fc-a9b9a3760922',
      name: 'Financial aid',
      category: 'Income Resources'
    },
    {
      uuid: 'ecb5ecc1-1fb7-411d-8b8b-6d3bf8824add',
      name: 'The baccalaureate year',
      category: 'Questions for university education'
    },
    {
      uuid: 'ceea7967-ee71-42ca-adfd-b98d55bb5951',
      name: 'Baccalaureate Type',
      category: 'Questions for university education'
    },
    {
      uuid: '4871fa5f-8a27-48d4-b7fd-842d70841c6f',
      name: 'Total Grade (excluding religious studies grade)',
      category: 'Questions for university education'
    },
    {
      uuid: '2fd15db0-6d43-4e74-aaaa-f5e83809936c',
      name: 'Rank- Province',
      category: 'Questions for university education'
    },
    {
      uuid: '69b3e68e-7325-4239-8137-766980fd8a04',
      name: 'Rank- Country',
      category: 'Questions for university education'
    },
    {
      uuid: '563f5d6c-cee2-44d7-83c1-972c59be7d52',
      name: 'University Name',
      category: 'Questions for university education'
    },
    {
      uuid: '4bb1191f-5142-49f7-baaa-ca48f2a20779',
      name: 'College Name',
      category: 'Questions for university education'
    },
    {
      uuid: '8511b7c5-f03c-4ebe-a31d-bab2eb5c560f',
      name: 'The place of residence during the study',
      category: 'Questions for university education'
    },
    {
      uuid: '43eb54a8-a850-4bea-95ce-dfb334b7e826',
      name: 'academic year',
      category: 'Questions for university education'
    },
    {
      uuid: '653c0592-0c13-4544-bb91-4cef439ef40f',
      name: 'The average degrees of the previous year (for the second year and above)',
      category: 'Questions for university education'
    }
  ];

  communityGeneralNeed: any = [
    {
      uuid: 'a7d56366-524d-40b6-85bc-350fb582407f',
      name: 'The name of the village/neighborhood',
      value: ''
    },
    {
      uuid: '5b045915-68b9-4310-8da8-bd082741a3fe',
      name: 'Number of families',
      value: ''
    },
    {
      uuid: '8c6ae867-25e5-4118-b9ff-78d4f525268b',
      name: 'The number of families of the breadwinner (widows, divorced)',
      value: ''
    },
    {
      uuid: '7dc958cc-e99c-4eeb-b716-eefeae229eff',
      name: 'The number of elderly people who miss the breadwinner',
      value: ''
    },
    {
      uuid: '5629eba1-23eb-42af-8e4d-a02c36143917',
      name: 'The number of the elderly people of a breadwinner',
      value: ''
    },
    {
      uuid: 'd3f9216b-4532-46c5-ba98-3206df364111',
      name: 'The number of families with special needs',
      value: ''
    },
    {
      uuid: '3a06f29b-5971-4c11-b48f-5d6a47f1cd7c',
      name: 'The area of the land that is currently cultivated (dunum)',
      value: ''
    },
    {
      uuid: '3de780e7-fc72-41ff-9bcb-2e3008be7811',
      name: 'The land area that guarantees grazing (dunum)',
      value: ''
    },
    {
      uuid: 'debcd879-c361-4b28-b5c8-74151d0ef657',
      name: 'The number of heads of livestock sponsored by the permanent population',
      value: ''
    },
    {
      uuid: '2a61eeed-7944-45c4-a896-f314ce7159d6',
      name: 'The number of heads of livestock sponsored by the nomads',
      value: ''
    },
    {
      uuid: '62092f33-1cc3-4213-ab66-4c3f22dcf7f1',
      name: 'The number of grocery stores',
      value: ''
    },
    {
      uuid: 'b772f55d-2240-48d1-9dae-7f451d1ab283',
      name: 'The distance from the nearest grocery store (if it is not present) (km)',
      value: ''
    },
    {
      uuid: 'a79e4db3-c823-4056-90d2-52b12c09f738',
      name: 'The number of home appliances stores',
      value: ''
    },
    {
      uuid: 'd85a1880-d5bc-4e26-8670-d358e5f9b82f',
      name: 'The distance from the nearest home tool store (if it is not) (km)',
      value: ''
    },
    {
      uuid: 'fad491e4-09ba-490c-bb49-f1b940385dad',
      name: 'The number of clothes stores',
      value: ''
    },
    {
      uuid: '5433a092-a75f-491a-806a-b5244d0c99f4',
      name: 'The distance from the nearest clothing store (if he is not present (km)',
      value: ''
    },
    {
      uuid: 'f8370fd3-6af3-4893-856a-b6705ef338f7',
      name: 'The number of home stores',
      value: ''
    },
    {
      uuid: 'b7b78b39-63a4-4957-9b38-adf443565e15',
      name: 'The number of dairy workshops and cheese (including domestic)',
      value: ''
    },
    {
      uuid: '589e120f-2d53-4ed2-b434-5898a8409c2a',
      name: 'The number of pharmacies',
      value: ''
    },
    {
      uuid: '75f57aaf-9897-4aad-957d-b0c7f8d62456',
      name: 'The distance from the nearest pharmacy (if it is not present) (km)',
      value: ''
    },
    {
      uuid: '697459ad-d655-4a4b-a6c9-ce6be09201a0',
      name: 'The number of local doctors',
      value: ''
    },
    {
      uuid: '73ff989d-8956-4d63-8add-c3356a33a2c6',
      name: 'The number of doctors providing home medical services',
      value: ''
    },
    {
      uuid: 'bc65bd68-60cf-4d7c-8412-4c727e70d2b4',
      name: 'The distance from the nearest doctor (if he is not present) (km)',
      value: ''
    },
    {
      uuid: 'ea219465-fa8b-4f54-9648-3db925870cd2',
      name: 'Number of nurses',
      value: ''
    },
    {
      uuid: 'd31308b2-80ae-4df1-864d-117af064f163',
      name: 'The number of nurses provided for home medical services',
      value: ''
    },
    {
      uuid: '8d56605f-b09c-4627-be2f-dfaa07aee922',
      name: 'The distance from the nearest nurse (if he is not present) (km)',
      value: ''
    },
    {
      uuid: 'b2dc40a6-8134-47f4-8e1a-497c23809a53',
      name: 'The distance from the nearest ambulance (0 in the event of the assembly) (km)',
      value: ''
    },
    {
      uuid: '38052e1e-f9ae-4931-a570-0111ad3455c3',
      name: 'Number of primary schools',
      value: ''
    },
    {
      uuid: 'f758a32a-1cf8-4733-812b-b1c927b6964b',
      name: 'The distance from the nearest elementary (if it is not present) (km)',
      value: ''
    },
    {
      uuid: 'eb0db02c-96ca-4d35-a200-dbe24e65aee8',
      name: 'The number of students in the primary stage',
      value: ''
    },
    {
      uuid: '3b34d321-ea86-44ee-8485-66ea5d55d99e',
      name: 'The number of middle schools',
      value: ''
    },
    {
      uuid: '0c57968d-4817-4844-a518-28cb91a92020',
      name: 'The distance from the nearest preparation (if it is not present) (km)',
      value: ''
    },
    {
      uuid: '3b642a07-6822-4458-b811-efaa953a0465',
      name: 'The number of students in the preparatory stage',
      value: ''
    },
    {
      uuid: '4ebcd907-9db0-47cf-b333-60778cd6979c',
      name: 'The number of high schools',
      value: ''
    },
    {
      uuid: '7e68cf58-c268-4da5-961e-8b0d6d64a825',
      name: 'The distance from the nearest high school (if it is not present) (km)',
      value: ''
    },
    {
      uuid: '71e51f18-d7f0-435c-9ac1-7900b6773624',
      name: 'The number of students in the secondary stage',
      value: ''
    },
    {
      uuid: '664c3591-5cb9-4dd7-8e04-0754b33d44bb',
      name: 'The number of students in the university stage',
      value: ''
    },
    {
      uuid: '0040015b-c81c-444d-b727-cbaa912ffd4c',
      name: 'The number of primary schools (residents)',
      value: ''
    },
    {
      uuid: 'f758a32a-1cf8-4733-812b-b1c927b6964b',
      name: 'The distance from the nearest elementary (if it is not present) (km)',
      value: ''
    },
    {
      uuid: 'eb0db02c-96ca-4d35-a200-dbe24e65aee8',
      name: 'The number of students in the primary stage',
      value: ''
    },
    {
      uuid: '3b34d321-ea86-44ee-8485-66ea5d55d99e',
      name: 'The number of middle schools',
      value: ''
    },
    {
      uuid: '0c57968d-4817-4844-a518-28cb91a92020',
      name: 'The distance from the nearest preparation (if it is not present) (km)',
      value: ''
    },
    {
      uuid: '3b642a07-6822-4458-b811-efaa953a0465',
      name: 'The number of students in the preparatory stage',
      value: ''
    },
    {
      uuid: '4ebcd907-9db0-47cf-b333-60778cd6979c',
      name: 'The number of high schools',
      value: ''
    },
    {
      uuid: '7e68cf58-c268-4da5-961e-8b0d6d64a825',
      name: 'The distance from the nearest high school (if it is not present) (km)',
      value: ''
    },
    {
      uuid: '71e51f18-d7f0-435c-9ac1-7900b6773624',
      name: 'The number of students in the secondary stage',
      value: ''
    },
    {
      uuid: '664c3591-5cb9-4dd7-8e04-0754b33d44bb',
      name: 'The number of students in the university stage',
      value: ''
    },
    {
      uuid: '0040015b-c81c-444d-b727-cbaa912ffd4c',
      name: 'The number of primary schools (residents)',
      value: ''
    },
    {
      uuid: '39d9e43a-c09a-4305-9589-c0e74293dcb3',
      name: 'The number of middle schools (residents)',
      value: ''
    },
    {
      uuid: '434541f0-86e6-4277-aa58-c72b10a846e3',
      name: 'The number of high school schools (residents)',
      value: ''
    },
    {
      uuid: '1d18db25-03db-4e29-858e-1f6a0405f182',
      name: 'Is there a local committee/association concerned with residents in the region',
      value: ''
    },
    {
      uuid: '110b1415-ec6a-4064-a86e-0bedd44b2b39',
      name: 'The number of members of the committee/board of directors',
      value: ''
    },
    {
      uuid: 'c31ccf09-2b86-4dcd-bb36-e8edb94dc7b7',
      name: 'Does the association/committee have a bank account',
      value: ''
    },
    {
      uuid: '54122ef8-86e0-47dc-b44b-6b7ead17b95c',
      name: 'Are there periodic fees?',
      value: ''
    },
    {
      uuid: 'd21c78d6-7c77-4a66-9327-8281283d92d9',
      name: 'Do you use the computer to coordinate the work of the association (tables, budget account ...)',
      value: ''
    },
    {
      uuid: '3e958842-272f-438c-9ab3-fdbe447443c1',
      name: 'What is the number of subscribers?',
      value: ''
    },
    {
      uuid: 'a4f2787a-4a68-452e-adce-a330c09eae44',
      name: 'What are the most important services provided (major points)',
      value: ''
    },
    {
      uuid: 'af9e9772-c7f9-4739-ab4e-6426d635bcb2',
      name: 'Are there any strong family or tribal differences within the neighborhood/village that hinder joint work within the neighborhood or village? Please explain',
      value: ''
    },
    {
      uuid: '9e78ec8e-3bd0-46ff-9192-e401dfa667ea',
      name: 'Have any violent incidents with the neighborhood occurred during the crisis years? Please explain',
      value: ''
    },
    {
      uuid: '39c1ed30-b71f-46ce-8516-df9b7f69237f',
      name: 'Has a decline in trade or service exchange or desertion of border lands occurred with the neighborhood? Please explain',
      value: ''
    },
    {
      uuid: '579ae6d0-8874-438f-a45a-f0237cf9382a',
      name: 'Is there any improvement in trade or service exchange with them in recent years? Please explain',
      value: ''
    },
    {
      uuid: '186a4c1b-90a7-4af8-ba91-a4865811130a',
      name: 'Is there any desire to rebuild trade or service relations? Please explain',
      value: ''
    },
    {
      uuid: '247ca913-6946-433e-8fd7-a118f5b9f02d',
      name: 'What are the barriers that hinder the rebuilding of these commercial or service relationships? Please explain',
      value: ''
    }
  ];

  lang: string;

  constructor(
    private route: ActivatedRoute,
    private visitService: VisitService) {

  }

  ngOnInit(): void {
    this.lang = this.getLang();
    const uuid = this.route.snapshot.paramMap.get("patient_id");
    this.visitService.patientInfo(uuid).subscribe((info) => {
      this.surveyOfAcuteHomecare.forEach((e: any) => {
        const val = info?.person.attributes.find((o: any)=> o.attributeType.uuid == e.uuid);
        e.value = (val) ? JSON.parse(val?.value) : null;
      });

      this.medicalEmergencyNeed.forEach((e: any) => {
        const val = info?.person.attributes.find((o: any)=> o.attributeType.uuid == e.uuid);
        e.value = (val) ? JSON.parse(val?.value) : null;
      });

      this.generalFamilyNeed.forEach((e: any) => {
        const val = info?.person.attributes.find((o: any)=> o.attributeType.uuid == e.uuid);
        e.value = (val) ? JSON.parse(val?.value) : null;
      });

      this.studentNeed.forEach((e: any) => {
        const val = info?.person.attributes.find((o: any)=> o.attributeType.uuid == e.uuid);
        e.value = (val) ? JSON.parse(val?.value) : null;
      });

      this.communityGeneralNeed.forEach((e: any) => {
        const val = info?.person.attributes.find((o: any)=> o.attributeType.uuid == e.uuid);
        e.value = (val) ? JSON.parse(val?.value) : null;
      });
    });
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
  }
}
