import { TicketListRes, TicketRes, UserRes } from "./types";

const scriptProperties = PropertiesService.getScriptProperties();

const cookie = `_huntr_session_production=${scriptProperties.getProperty(
  "wantedlyToken"
)}`;

function slack(data: any) {
  return UrlFetchApp.fetch(scriptProperties.getProperty("slackHook"), {
    payload: JSON.stringify(data)
  });
}

const url = {
  getTickets:
    "https://www.wantedly.com/api/internal/enterprise/tickets?state=pending&sort_type=number_reverse",
  getTicket(id: number) {
    return `https://www.wantedly.com/api/internal/enterprise/tickets/${id}`;
  },
  getUser(id: number, candidacyId: number) {
    return `https://www.wantedly.com/api/internal/enterprise/users/${id}?candidacy_id=${candidacyId}`;
  }
};

const headers = {
  cookie
};

function toSlackData({
  ticket: { data: ticket },
  user
}: {
  ticket: TicketRes;
  user: UserRes;
}) {
  return {
    text: [
      `${user.user.name} (${user.user.age}) ${user.location} ${user.current_position} ${user.tagline}`,
      `https://www.wantedly.com/enterprise/tickets/${ticket.number} ${ticket.created_at}`,
      user.introduction,
      "--",
      "このさきやってみたいこと",
      user.statement,
      "--",
      "職歴",
      user.working_histories
        ?.map(
          e =>
            `${e.started_on} - ${e.ended_on} ${e.company_name} ${e.position} ${e.description}`
        )
        .join("\n\n"),
      "--",
      "学歴",
      user.academic_records
        ?.map(
          e => `${e.graduated_on} ${e.school_name} ${e.major} ${e.description}`
        )
        .join("\n"),
      "--",
      "スキル",
      user.skill_taggings?.map(e => e.tag.name).join(", "),
      "--",
      "ポートフォリオ",
      user.portfolio_items?.map(e => `${e.title} ${e.url}`).join("\n"),
      "最終更新: " + user.last_edit,
      "--",
      "部活・サークル・ボランティア",
      user.volunteerings
        ?.map(e => `${e.started_on} - ${e.ended_on} ${e.title}`)
        .join("\n"),
      "--",
      "資格・認定",
      user.certificates?.map(e => `${e.qualified_on} ${e.title}`).join("\n"),
      "--",
      ticket.project.title
    ].join("\n")
  };
}

function addAlreadySentId(id: number) {
  const prev: number[] = JSON.parse(
    scriptProperties.getProperty("alreadySentIds") || "[]"
  );
  scriptProperties.setProperty("alreadySentIds", JSON.stringify([...prev, id]));
}

export function main() {
  const alreadySentIds: number[] = JSON.parse(
    scriptProperties.getProperty("alreadySentIds") || "[]"
  );

  const tickets: TicketListRes = JSON.parse(
    UrlFetchApp.fetch(url.getTickets, { headers }).getContentText()
  );

  for (const { number: ticketNumber } of tickets.data.tickets
    .filter(e => !alreadySentIds.includes(e.number))
    .sort((a, b) => a.number - b.number)) {
    console.log(ticketNumber);
    const ticket: TicketRes = JSON.parse(
      UrlFetchApp.fetch(url.getTicket(ticketNumber), {
        headers
      }).getContentText()
    );

    console.log(ticket.data);
    const user: UserRes = JSON.parse(
      UrlFetchApp.fetch(
        url.getUser(ticket.data.candidate.id, ticket.data.candidacy.id),
        { headers }
      ).getContentText()
    );
    console.log(user);

    slack(toSlackData({ ticket, user }));

    addAlreadySentId(ticket.data.number);
  }
}
