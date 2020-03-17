// INCOMPLETE response types of wantedly API

export interface TicketListRes {
  data: {
    tickets: {
      number: number;
    }[];
  };
}

export interface TicketRes {
  data: {
    number: number;
    created_at: string;
    candidacy: {
      id: number;
    };
    candidate: {
      id: number;
    };
    project: {
      id: number;
      title: string;
    };
  };
}

export interface UserRes {
  location: string;
  tagline: string;
  last_edit: string;
  current_position: string;
  user: {
    name: string;
    age: number;
  };
  introduction: string;
  statement: string; // 「このさきやってみたいこと」
  working_histories: {
    id: number;
    company_name: string;
    started_on: string;
    ended_on: string;
    position: string;
    description: string;
  }[];
  company_names: any[];
  academic_records: {
    school_name: string;
    description: string;
    graduated_on: string;
    major: string;
    id: number;
  }[];
  skill_taggings: {
    tag: {
      name: string;
    };
  }[];
  portfolio_items: {
    title: string;
    url: string;
  }[];
  volunteerings: {
    title: string;
    started_on: string;
    ended_on: string;
  }[];
  certificates: {
    // 資格・認定
    qualified_on: string;
    title: string;
  }[];
}
