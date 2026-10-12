/* Gera as três páginas legais (privacidade, cookies, termos) em public/: `node legal-pages.js`.
   O texto vive aqui para o cabeçalho, o rodapé e os dados da casa serem iguais nas três.
   Ao mudar o texto, atualizar DATA e POLICY_VERSION em public/js/shared.js. */
"use strict";
const fs = require("fs");
const path = require("path");

const DATA = { pt: "12 de outubro de 2026", en: "12 October 2026" };
const CASA = `<address>O Polvo (restaurante)<br>NIF 112042864<br>Urbanização do Pisão, Lote 2<br>2560-042 Santa Cruz, Torres Vedras, Portugal<br>Telefone: <a href="tel:+351261931400">261 931 400</a><br>E-mail: <a href="mailto:opolvo@outlook.pt">opolvo@outlook.pt</a></address>`;
const NOVO = { pt: ' <span class="sr">(abre num novo separador)</span>', en: ' <span class="sr">(opens in a new tab)</span>' };
const ext = (href, text, l) => `<a href="${href}" target="_blank" rel="noopener">${text}${NOVO[l]}</a>`;

const PAGES = {
  "privacidade.html": {
    pt: `
<h1>Política de Privacidade</h1>
<p class="meta">Em vigor desde ${DATA.pt}.</p>
<div class="resumo">
  <p><strong>Em resumo.</strong> Para reservar mesa pedimos o seu nome e um telefone, mais os dados do pedido. Usamo-los só para gerir a reserva e apagamo-los 90 dias depois da data da refeição.</p>
  <p>Este site não tem publicidade nem ferramentas de estatística, não cria perfis e não vende nem cede dados para marketing.</p>
</div>

<h2>1. Quem é responsável pelos seus dados</h2>
<p>O responsável pelo tratamento é o titular do estabelecimento de restauração O Polvo:</p>
${CASA}
<p>Não temos encarregado de proteção de dados. Para qualquer assunto sobre os seus dados, use os contactos acima.</p>

<h2>2. Que dados tratamos, para quê e durante quanto tempo</h2>
<div class="tb"><table>
  <thead><tr><th scope="col">Situação</th><th scope="col">Dados</th><th scope="col">Finalidade e fundamento</th><th scope="col">Conservação</th></tr></thead>
  <tbody>
    <tr><th scope="row">Pedido de reserva feito no site</th><td>Nome, telefone, data, hora, número de pessoas, preferência de zona; ocasião e notas, se as escrever; data e hora do pedido e da aceitação dos Termos; código da reserva.</td><td>Gerir a reserva e contactá-lo sobre ela. Fundamento: diligências pré-contratuais a seu pedido (artigo 6.º, n.º 1, alínea b), do RGPD).</td><td>90 dias depois da data da refeição. Depois disso o sistema apaga o registo automaticamente.</td></tr>
    <tr><th scope="row">Reserva feita por telefone ou no restaurante</th><td>Os mesmos dados, registados pela equipa; e-mail, se o indicar.</td><td>A mesma finalidade e o mesmo fundamento.</td><td>O mesmo prazo de 90 dias.</td></tr>
    <tr><th scope="row">Contacto por e-mail ou telefone</th><td>Os dados que nos der na mensagem ou na chamada.</td><td>Responder ao seu pedido. Fundamento: diligências a seu pedido ou o nosso interesse legítimo em responder a quem nos contacta (artigo 6.º, n.º 1, alíneas b) e f)).</td><td>O tempo necessário para tratar o assunto.</td></tr>
    <tr><th scope="row">Segurança do site</th><td>Endereço IP.</td><td>Limitar pedidos abusivos ao formulário e ao acesso da equipa. Fundamento: interesse legítimo na segurança do serviço (artigo 6.º, n.º 1, alínea f)).</td><td>O sistema de reservas mantém-no apenas em memória, no máximo durante uma hora, e não o guarda em ficheiro. O prestador de alojamento pode manter registos técnicos de acesso.</td></tr>
  </tbody>
</table></div>

<h3>Dados de saúde</h3>
<p>Não pedimos nem precisamos de dados de saúde para reservar uma mesa, e pedimos-lhe que não os escreva no formulário. Se tem uma alergia ou intolerância alimentar, fale com a equipa quando chegar. Se, mesmo assim, incluir essa informação nas notas, ela será usada apenas para preparar a sua mesa e apagada no mesmo prazo.</p>

<h3>É obrigatório dar estes dados?</h3>
<p>O nome e o telefone são necessários para pedir uma reserva pelo site, porque é por telefone que a confirmamos. A ocasião e as notas são opcionais. Se preferir não usar o formulário, pode reservar pelo 261 931 400.</p>

<h2>3. O que não fazemos</h2>
<ul>
  <li>Não enviamos publicidade nem newsletters.</li>
  <li>Não usamos ferramentas de estatística, de publicidade ou de redes sociais que o sigam.</li>
  <li>Não criamos perfis nem tomamos decisões automatizadas sobre si.</li>
  <li>Não vendemos nem cedemos os seus dados para fins de marketing.</li>
</ul>

<h2>4. Quem tem acesso aos dados</h2>
<ul>
  <li><strong>A equipa do restaurante</strong>, através de uma área reservada protegida por palavra-passe.</li>
  <li><strong>O prestador de alojamento do site</strong>, que guarda o sistema de reservas por nossa conta, como subcontratante.</li>
  <li><strong>O fornecedor do nosso correio eletrónico</strong> (Microsoft, serviço Outlook), se nos escrever por e-mail.</li>
  <li><strong>WhatsApp</strong>: podemos confirmar a reserva por chamada ou por mensagem de WhatsApp para o número que indicou. Nesse caso, o número e a mensagem passam pelo serviço WhatsApp (grupo Meta), segundo as regras desse serviço. Se preferir ser contactado apenas por chamada, diga-o nas notas.</li>
  <li><strong>Google Maps</strong>: o mapa só é carregado se clicar em «Carregar o mapa do Google». Ao fazê-lo, a Google recebe o seu endereço IP e pode guardar cookies no seu dispositivo, nos termos da ${ext("https://policies.google.com/privacy", "política de privacidade da Google", "pt")}.</li>
  <li><strong>Autoridades</strong>, quando a lei o exigir.</li>
</ul>
<p>O WhatsApp e a Google são prestados por empresas que podem tratar dados fora do Espaço Económico Europeu, de acordo com as suas próprias políticas. Fora desses dois casos, não enviamos os seus dados para fora do Espaço Económico Europeu.</p>

<h2>5. Os seus direitos</h2>
<p>Pode, a qualquer momento, pedir-nos:</p>
<ul>
  <li>para saber se temos dados seus e receber uma cópia (acesso);</li>
  <li>a correção de dados errados ou incompletos (retificação);</li>
  <li>que apaguemos os seus dados (apagamento);</li>
  <li>que limitemos o tratamento ou opor-se a ele, nos casos previstos na lei;</li>
  <li>os dados que nos forneceu num formato de uso corrente (portabilidade).</li>
</ul>
<p>Para exercer estes direitos, escreva para <a href="mailto:opolvo@outlook.pt">opolvo@outlook.pt</a> ou ligue 261 931 400, indicando o nome e o telefone usados na reserva ou o código da reserva. Respondemos no prazo máximo de um mês.</p>
<p>Se entender que os seus dados não foram tratados de acordo com a lei, pode apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD), em ${ext("https://www.cnpd.pt", "www.cnpd.pt", "pt")}.</p>

<h2>6. Como protegemos os dados</h2>
<p>As reservas ficam num sistema a que só a equipa acede, com palavra-passe. O formulário só aceita os campos estritamente necessários e o sistema apaga sozinho os registos antigos.</p>

<h2>7. Cookies e armazenamento no seu dispositivo</h2>
<p>O site não usa cookies. O que guarda no seu navegador, e em que casos, está descrito na <a href="cookies.html">Política de Cookies</a>.</p>

<h2>8. Lei aplicável e alterações</h2>
<p>Esta política segue o Regulamento Geral sobre a Proteção de Dados (Regulamento (UE) 2016/679) e a Lei n.º 58/2019. Se a alterarmos, publicamos a nova versão nesta página, com a data de entrada em vigor.</p>`,
    en: `
<h1>Privacy Policy</h1>
<p class="meta">In force since ${DATA.en}. This is a translation; if the two versions differ, the Portuguese text prevails.</p>
<div class="resumo">
  <p><strong>In short.</strong> To book a table we ask for your name and a phone number, plus the details of the request. We use them only to manage the booking and delete them 90 days after the date of the meal.</p>
  <p>This site has no advertising and no analytics tools, builds no profiles, and does not sell or share data for marketing.</p>
</div>

<h2>1. Who is responsible for your data</h2>
<p>The data controller is the owner of the restaurant O Polvo:</p>
${CASA.replace("(restaurante)", "(restaurant)").replace("Telefone:", "Phone:")}
<p>We have no data protection officer. For anything about your data, use the contacts above.</p>

<h2>2. What data we process, why and for how long</h2>
<div class="tb"><table>
  <thead><tr><th scope="col">Situation</th><th scope="col">Data</th><th scope="col">Purpose and legal basis</th><th scope="col">Retention</th></tr></thead>
  <tbody>
    <tr><th scope="row">Booking request made on the site</th><td>Name, phone number, date, time, number of guests, preferred area; occasion and notes, if you write them; date and time of the request and of your acceptance of the Terms; booking code.</td><td>Managing the booking and contacting you about it. Basis: steps taken at your request before entering into a contract (Article 6(1)(b) GDPR).</td><td>90 days after the date of the meal. After that the system deletes the record automatically.</td></tr>
    <tr><th scope="row">Booking made by phone or at the restaurant</th><td>The same data, recorded by the staff; e-mail address, if you give one.</td><td>The same purpose and basis.</td><td>The same 90 days.</td></tr>
    <tr><th scope="row">Contact by e-mail or phone</th><td>Whatever you tell us in the message or call.</td><td>Answering your request. Basis: steps at your request, or our legitimate interest in answering people who contact us (Article 6(1)(b) and (f)).</td><td>As long as needed to deal with the matter.</td></tr>
    <tr><th scope="row">Site security</th><td>IP address.</td><td>Limiting abusive requests to the form and to the staff login. Basis: legitimate interest in the security of the service (Article 6(1)(f)).</td><td>The booking system keeps it in memory only, for one hour at most, and does not write it to a file. The hosting provider may keep technical access logs.</td></tr>
  </tbody>
</table></div>

<h3>Health data</h3>
<p>We do not ask for or need health data to book a table, and we ask you not to write any in the form. If you have a food allergy or intolerance, tell the staff when you arrive. If you include that information in the notes anyway, it will be used only to prepare your table and deleted within the same period.</p>

<h3>Do you have to give this data?</h3>
<p>Your name and phone number are needed to request a booking through the site, because we confirm by phone. Occasion and notes are optional. If you would rather not use the form, you can book on 261 931 400.</p>

<h2>3. What we do not do</h2>
<ul>
  <li>We do not send advertising or newsletters.</li>
  <li>We do not use analytics, advertising or social media tools that track you.</li>
  <li>We do not build profiles or take automated decisions about you.</li>
  <li>We do not sell or share your data for marketing.</li>
</ul>

<h2>4. Who has access to the data</h2>
<ul>
  <li><strong>The restaurant's staff</strong>, through a password-protected staff area.</li>
  <li><strong>The site's hosting provider</strong>, which stores the booking system on our behalf, as a processor.</li>
  <li><strong>Our e-mail provider</strong> (Microsoft, Outlook service), if you write to us by e-mail.</li>
  <li><strong>WhatsApp</strong>: we may confirm the booking by a call or by a WhatsApp message to the number you gave. In that case the number and the message pass through the WhatsApp service (Meta group), under that service's rules. If you prefer to be contacted by call only, say so in the notes.</li>
  <li><strong>Google Maps</strong>: the map is only loaded if you click "Load the Google map". When you do, Google receives your IP address and may store cookies on your device, under ${ext("https://policies.google.com/privacy", "Google's privacy policy", "en")}.</li>
  <li><strong>Authorities</strong>, where the law requires it.</li>
</ul>
<p>WhatsApp and Google are provided by companies that may process data outside the European Economic Area, under their own policies. Apart from those two cases, we do not send your data outside the European Economic Area.</p>

<h2>5. Your rights</h2>
<p>You can ask us at any time:</p>
<ul>
  <li>whether we hold data about you and for a copy (access);</li>
  <li>to correct wrong or incomplete data (rectification);</li>
  <li>to delete your data (erasure);</li>
  <li>to restrict the processing or to object to it, in the cases provided by law;</li>
  <li>for the data you gave us in a commonly used format (portability).</li>
</ul>
<p>To exercise these rights, write to <a href="mailto:opolvo@outlook.pt">opolvo@outlook.pt</a> or call 261 931 400, giving the name and phone number used in the booking or the booking code. We answer within one month at most.</p>
<p>If you believe your data has not been handled lawfully, you can lodge a complaint with the Portuguese data protection authority, Comissão Nacional de Proteção de Dados (CNPD), at ${ext("https://www.cnpd.pt", "www.cnpd.pt", "en")}.</p>

<h2>6. How we protect the data</h2>
<p>Bookings are kept in a system only the staff can reach, with a password. The form accepts only the fields that are strictly needed, and the system deletes old records by itself.</p>

<h2>7. Cookies and storage on your device</h2>
<p>The site uses no cookies. What it stores in your browser, and when, is described in the <a href="cookies.html">Cookie Policy</a>.</p>

<h2>8. Applicable law and changes</h2>
<p>This policy follows the General Data Protection Regulation (Regulation (EU) 2016/679) and Portuguese Law no. 58/2019. If we change it, we publish the new version on this page with the date it takes effect.</p>`
  },

  "cookies.html": {
    pt: `
<h1>Política de Cookies</h1>
<p class="meta">Em vigor desde ${DATA.pt}.</p>
<div class="resumo">
  <p><strong>Em resumo.</strong> Este site não usa cookies e não tem ferramentas de estatística nem de publicidade. Por isso não mostra um aviso de consentimento: não há nada que precise dele.</p>
  <p>Guarda apenas, no seu navegador, a escolha de idioma, e só se a fizer.</p>
</div>

<h2>1. O que o site guarda no seu dispositivo</h2>
<p>Em vez de cookies, o site usa o armazenamento local do navegador, e só nos casos seguintes:</p>
<div class="tb"><table>
  <thead><tr><th scope="col">Nome</th><th scope="col">Onde</th><th scope="col">Para que serve</th><th scope="col">Quando é criado</th><th scope="col">Duração</th></tr></thead>
  <tbody>
    <tr><th scope="row"><code>opolvo.lang</code></th><td>Armazenamento local</td><td>Lembrar o idioma que escolheu (português ou inglês).</td><td>Só quando clica em PT ou EN.</td><td>Até limpar os dados do site no navegador.</td></tr>
    <tr><th scope="row"><code>opolvo.token</code></th><td>Armazenamento de sessão</td><td>Manter a sessão da equipa na área reservada.</td><td>Só quando um membro da equipa entra na área reservada. Os visitantes nunca o recebem.</td><td>Até fechar o separador.</td></tr>
    <tr><th scope="row"><code>opolvo.db.v1</code></th><td>Armazenamento local</td><td>Guardar reservas na versão de demonstração do site, que funciona sem servidor.</td><td>Só nessa versão de demonstração. No site publicado as reservas vão para o sistema do restaurante e isto não é usado.</td><td>Até limpar os dados do site no navegador.</td></tr>
  </tbody>
</table></div>
<p>Estes registos são estritamente necessários para funções que o próprio utilizador pede (mudar de idioma, iniciar sessão), pelo que a lei não exige consentimento para eles (artigo 5.º da Lei n.º 41/2004, na redação da Lei n.º 46/2012). Nenhum serve para o identificar ou seguir.</p>
<p>Os pratos que junta à «sua mesa» no menu ficam apenas na página aberta e desaparecem quando a fecha ou recarrega.</p>

<h2>2. Conteúdos de outras entidades</h2>
<ul>
  <li><strong>Google Maps.</strong> O mapa não é carregado ao abrir a página. Só é carregado se clicar em «Carregar o mapa do Google», depois de ler o aviso que está no próprio botão. A partir desse momento, a Google recebe o seu endereço IP e pode guardar cookies no seu dispositivo, nos termos da ${ext("https://policies.google.com/privacy", "política de privacidade da Google", "pt")}. Se não clicar, nada é enviado à Google.</li>
  <li><strong>Ligações externas.</strong> As ligações para o Google Maps (indicações), o Facebook e o Livro de Reclamações abrem outros sites, com as suas próprias regras. Enquanto não clicar, esses sites não recebem nada.</li>
  <li><strong>Tipos de letra.</strong> A letra do site é servida pelo próprio site, sem pedidos a serviços externos.</li>
</ul>

<h2>3. Como apagar o que foi guardado</h2>
<p>Nas definições do seu navegador, procure a opção de limpar os dados do site ou os dados de navegação. O site continua a funcionar e volta ao idioma do seu navegador.</p>

<h2>4. Se isto mudar</h2>
<p>Se o site passar a usar cookies ou ferramentas que exijam consentimento, pediremos esse consentimento antes de as ativar e atualizaremos esta página.</p>
<p>Para saber como tratamos dados pessoais, veja a <a href="privacidade.html">Política de Privacidade</a>.</p>`,
    en: `
<h1>Cookie Policy</h1>
<p class="meta">In force since ${DATA.en}. This is a translation; if the two versions differ, the Portuguese text prevails.</p>
<div class="resumo">
  <p><strong>In short.</strong> This site uses no cookies and has no analytics or advertising tools. That is why it shows no consent banner: there is nothing that needs one.</p>
  <p>It only stores your language choice in your browser, and only if you make one.</p>
</div>

<h2>1. What the site stores on your device</h2>
<p>Instead of cookies, the site uses the browser's local storage, and only in these cases:</p>
<div class="tb"><table>
  <thead><tr><th scope="col">Name</th><th scope="col">Where</th><th scope="col">What it is for</th><th scope="col">When it is created</th><th scope="col">Duration</th></tr></thead>
  <tbody>
    <tr><th scope="row"><code>opolvo.lang</code></th><td>Local storage</td><td>Remembering the language you chose (Portuguese or English).</td><td>Only when you click PT or EN.</td><td>Until you clear the site's data in your browser.</td></tr>
    <tr><th scope="row"><code>opolvo.token</code></th><td>Session storage</td><td>Keeping staff signed in to the staff area.</td><td>Only when a member of staff signs in. Visitors never receive it.</td><td>Until the tab is closed.</td></tr>
    <tr><th scope="row"><code>opolvo.db.v1</code></th><td>Local storage</td><td>Storing bookings in the demonstration version of the site, which runs without a server.</td><td>Only in that demonstration version. On the published site bookings go to the restaurant's system and this is not used.</td><td>Until you clear the site's data in your browser.</td></tr>
  </tbody>
</table></div>
<p>These entries are strictly necessary for functions the user asks for (changing language, signing in), so the law does not require consent for them (Article 5 of Portuguese Law no. 41/2004, as amended by Law no. 46/2012). None of them is used to identify or track you.</p>
<p>The dishes you add to "your table" on the menu stay only in the open page and disappear when you close or reload it.</p>

<h2>2. Content from other parties</h2>
<ul>
  <li><strong>Google Maps.</strong> The map is not loaded when the page opens. It is only loaded if you click "Load the Google map", after reading the notice on the button itself. From that moment Google receives your IP address and may store cookies on your device, under ${ext("https://policies.google.com/privacy", "Google's privacy policy", "en")}. If you do not click, nothing is sent to Google.</li>
  <li><strong>External links.</strong> The links to Google Maps (directions), Facebook and the Complaints Book open other sites, with their own rules. Until you click, those sites receive nothing.</li>
  <li><strong>Fonts.</strong> The site's typeface is served by the site itself, with no requests to outside services.</li>
</ul>

<h2>3. How to delete what was stored</h2>
<p>In your browser's settings, look for the option to clear site data or browsing data. The site keeps working and goes back to your browser's language.</p>

<h2>4. If this changes</h2>
<p>If the site starts using cookies or tools that require consent, we will ask for that consent before turning them on and update this page.</p>
<p>To see how we handle personal data, read the <a href="privacidade.html">Privacy Policy</a>.</p>`
  },

  "termos.html": {
    pt: `
<h1>Termos e Condições</h1>
<p class="meta">Em vigor desde ${DATA.pt}. Incluem os Termos de reserva (ponto 4).</p>

<h2>1. Quem somos</h2>
<p>Este site pertence ao restaurante O Polvo:</p>
${CASA}

<h2>2. O que é este site</h2>
<p>O site dá informação sobre o restaurante (menu, horário, localização, contactos) e permite pedir uma reserva de mesa. Não vende produtos, não recebe encomendas e não aceita pagamentos.</p>
<p>Fazemos por manter a informação certa e atualizada, mas o horário, a carta e os preços podem mudar sem que o site seja atualizado no mesmo momento. Em caso de diferença, vale o que estiver afixado e a carta em vigor no restaurante. Confirme por telefone qualquer informação que seja decisiva para si.</p>

<h2>3. Menu e preços</h2>
<ul>
  <li>Os preços são indicados em euros e incluem IVA à taxa em vigor.</li>
  <li>A função «a sua mesa» serve só para fazer contas: mostra uma estimativa e não é uma encomenda, uma reserva de pratos nem um compromisso de preço.</li>
  <li>A página do menu não indica os alergénios. Se tem uma alergia ou intolerância alimentar, informe a equipa antes de pedir.</li>
</ul>

<h2>4. Termos de reserva</h2>
<ul>
  <li><strong>O formulário envia um pedido, não uma reserva confirmada.</strong> Depois de o enviar, recebe um código e o pedido fica «por confirmar».</li>
  <li><strong>A reserva só é válida depois de o restaurante a confirmar</strong>, por chamada ou por mensagem para o telefone que indicou. Se não conseguirmos contactá-lo, o pedido pode não ser aceite.</li>
  <li>O restaurante pode não aceitar um pedido, por exemplo por falta de lugares, por encerramento ou por evento privado.</li>
  <li>A zona (sala ou esplanada) é uma preferência e depende da disponibilidade. A esplanada depende também do tempo.</li>
  <li>Para grupos acima do número de pessoas que o formulário permite, para eventos e para catering, ligue 261 931 400.</li>
  <li><strong>Para alterar ou cancelar</strong>, ligue 261 931 400 e indique o código da reserva. Pedimos que avise logo que souber, para podermos dar a mesa a outras pessoas.</li>
  <li>Os dados do pedido têm de ser verdadeiros e o telefone tem de ser um número em que o possamos contactar.</li>
</ul>

<h2>5. Pagamentos e reembolsos</h2>
<p>Pedir uma reserva é gratuito. O site não pede sinal, pré-pagamento nem dados de cartão, e não cobra qualquer valor. Como nada é pago através do site, não há valores a reembolsar e, por isso, não existe uma política de reembolsos.</p>
<p>As refeições são pagas no restaurante. Meios de pagamento aceites: dinheiro, cartão de débito, Visa, Mastercard, American Express, contactless e Ticket Restaurant.</p>

<h2>6. Takeaway, catering e eventos privados</h2>
<p>Estes serviços são tratados diretamente com o restaurante, por telefone. As condições de cada pedido (preço, data, sinal, cancelamento) são combinadas caso a caso e não fazem parte destes termos.</p>

<h2>7. Dados pessoais e cookies</h2>
<p>O tratamento dos seus dados está descrito na <a href="privacidade.html">Política de Privacidade</a> e o que o site guarda no seu navegador na <a href="cookies.html">Política de Cookies</a>.</p>

<h2>8. Conteúdos e direitos de autor</h2>
<p>Os textos, o desenho, os gráficos e o código deste site pertencem ao restaurante ou são usados com autorização, e não podem ser copiados para fins comerciais sem autorização. O tipo de letra Archivo é usado ao abrigo da licença SIL Open Font License 1.1.</p>

<h2>9. Ligações para outros sites</h2>
<p>O site tem ligações para o Google Maps, o Facebook e o Livro de Reclamações. Não controlamos esses sites nem respondemos pelo seu conteúdo ou pelas suas regras de privacidade.</p>

<h2>10. Responsabilidade</h2>
<p>Não garantimos que o site esteja sempre disponível e sem erros. Nada nestes termos limita os direitos que a lei reconhece aos consumidores.</p>

<h2>11. Reclamações e resolução de litígios</h2>
<p>Como em qualquer estabelecimento de restauração, pode pedir o Livro de Reclamações no restaurante. Pode também reclamar no${ext("https://www.livroreclamacoes.pt/inicio", "Livro de Reclamações Eletrónico", "pt")}.</p>
<p>Em caso de litígio de consumo, o consumidor pode recorrer a uma entidade de resolução alternativa de litígios de consumo. A lista das entidades está no Portal do Consumidor, em ${ext("https://www.consumidor.gov.pt", "www.consumidor.gov.pt", "pt")}.</p>

<h2>12. Lei aplicável e alterações</h2>
<p>Estes termos regem-se pela lei portuguesa. Podemos alterá-los; a versão em vigor é a publicada nesta página, com a respetiva data. A cada pedido de reserva aplica-se a versão aceite no momento do pedido.</p>`,
    en: `
<h1>Terms and Conditions</h1>
<p class="meta">In force since ${DATA.en}. They include the Booking terms (section 4). This is a translation; if the two versions differ, the Portuguese text prevails.</p>

<h2>1. Who we are</h2>
<p>This site belongs to the restaurant O Polvo:</p>
${CASA.replace("(restaurante)", "(restaurant)").replace("Telefone:", "Phone:")}

<h2>2. What this site is</h2>
<p>The site gives information about the restaurant (menu, opening hours, location, contacts) and lets you request a table booking. It does not sell products, take orders or accept payments.</p>
<p>We try to keep the information correct and up to date, but opening hours, the menu and prices can change before the site is updated. If they differ, what is displayed at the restaurant and the menu in force there apply. Please confirm by phone any information that is decisive for you.</p>

<h2>3. Menu and prices</h2>
<ul>
  <li>Prices are in euros and include VAT at the current rate.</li>
  <li>The "your table" feature is only for adding things up: it shows an estimate and is not an order, a reservation of dishes or a price commitment.</li>
  <li>The menu page does not list allergens. If you have a food allergy or intolerance, tell the staff before ordering.</li>
</ul>

<h2>4. Booking terms</h2>
<ul>
  <li><strong>The form sends a request, not a confirmed booking.</strong> After sending it you get a code and the request is "to be confirmed".</li>
  <li><strong>The booking is only valid once the restaurant confirms it</strong>, by a call or a message to the phone number you gave. If we cannot reach you, the request may not be accepted.</li>
  <li>The restaurant may decline a request, for example for lack of seats, closure or a private event.</li>
  <li>The area (dining room or terrace) is a preference and depends on availability. The terrace also depends on the weather.</li>
  <li>For groups larger than the form allows, for events and for catering, call 261 931 400.</li>
  <li><strong>To change or cancel</strong>, call 261 931 400 and give the booking code. Please let us know as soon as you can, so we can offer the table to others.</li>
  <li>The details in the request must be true and the phone number must be one we can reach you on.</li>
</ul>

<h2>5. Payments and refunds</h2>
<p>Requesting a booking is free. The site asks for no deposit, prepayment or card details and charges nothing. Since nothing is paid through the site, there is nothing to refund, and so there is no refund policy.</p>
<p>Meals are paid for at the restaurant. Accepted payment methods: cash, debit card, Visa, Mastercard, American Express, contactless and Ticket Restaurant.</p>

<h2>6. Takeaway, catering and private events</h2>
<p>These services are arranged directly with the restaurant, by phone. The conditions of each request (price, date, deposit, cancellation) are agreed case by case and are not part of these terms.</p>

<h2>7. Personal data and cookies</h2>
<p>How your data is handled is described in the <a href="privacidade.html">Privacy Policy</a>, and what the site stores in your browser in the <a href="cookies.html">Cookie Policy</a>.</p>

<h2>8. Content and copyright</h2>
<p>The texts, design, graphics and code of this site belong to the restaurant or are used with permission, and may not be copied for commercial purposes without permission. The Archivo typeface is used under the SIL Open Font License 1.1.</p>

<h2>9. Links to other sites</h2>
<p>The site links to Google Maps, Facebook and the Complaints Book. We do not control those sites and are not responsible for their content or privacy rules.</p>

<h2>10. Liability</h2>
<p>We do not guarantee that the site will always be available and free of errors. Nothing in these terms limits the rights the law gives consumers.</p>

<h2>11. Complaints and dispute resolution</h2>
<p>As in any restaurant in Portugal, you can ask for the Complaints Book on the premises. You can also complain through the${ext("https://www.livroreclamacoes.pt/inicio", "Electronic Complaints Book", "en")}.</p>
<p>In a consumer dispute, the consumer may turn to a consumer alternative dispute resolution body. The list of bodies is on the Portuguese Consumer Portal, at ${ext("https://www.consumidor.gov.pt", "www.consumidor.gov.pt", "en")}.</p>

<h2>12. Applicable law and changes</h2>
<p>These terms are governed by Portuguese law. We may change them; the version in force is the one published on this page, with its date. Each booking request is subject to the version accepted when the request was made.</p>`
  }
};

const NAV = [["privacidade.html", "Política de Privacidade", "Privacy Policy"], ["cookies.html", "Política de Cookies", "Cookie Policy"], ["termos.html", "Termos e Condições", "Terms and Conditions"]];
const LOGO = '<svg viewBox="0 0 36 36" aria-hidden="true"><rect width="36" height="36" rx="10" fill="#f2b544"/><path d="M9 25c0-9 4.5-15 10.5-15 4.5 0 7.5 3 7.5 7s-2.800 6.500-6.200 6.500c-2.800 0-4.800-1.800-4.800-4.200 0-2 1.400-3.300 3.200-3.300" fill="none" stroke="#0a1024" stroke-width="2.600" stroke-linecap="round"/></svg>';

Object.keys(PAGES).forEach((name) => {
  const p = PAGES[name], titulo = NAV.find((n) => n[0] === name)[1];
  const links = (l) => NAV.map((n) => `<li><a href="${n[0]}"${n[0] === name ? ' aria-current="page"' : ""}>${n[l === "pt" ? 1 : 2]}</a></li>`).join("");
  const html = `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo} · O Polvo</title>
<meta name="theme-color" content="#0a1024">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Crect width='36' height='36' rx='10' fill='%23f2b544'/%3E%3C/svg%3E">
<link rel="stylesheet" href="css/site.css">
<link rel="stylesheet" href="css/legal.css">
</head>
<body class="dark legal">
<a class="skip" href="#conteudo"><span data-l="pt">Saltar para o texto</span><span data-l="en" lang="en" hidden>Skip to the text</span></a>
<header class="lg-hd dark">
  <a class="logo" href="index.html" aria-label="O Polvo">${LOGO}<span>O<b>Polvo</b></span></a>
  <div class="end">
    <div class="lang" role="group" aria-label="Idioma / Language">
      <button type="button" data-lang="pt" aria-pressed="true">PT</button>
      <button type="button" data-lang="en" aria-pressed="false">EN</button>
    </div>
    <a class="btn btn-g btn-sm" href="index.html"><span data-l="pt">Voltar ao site</span><span data-l="en" lang="en" hidden>Back to the site</span></a>
  </div>
</header>
<main id="conteudo" class="legal-main light" tabindex="-1">
  <article class="wrap lg" data-l="pt" lang="pt">${p.pt}
  </article>
  <article class="wrap lg" data-l="en" lang="en" hidden>${p.en}
  </article>
</main>
<footer class="lg-ft dark">
  <nav aria-label="Páginas legais">
    <ul data-l="pt">${links("pt")}<li><a href="index.html">Início</a></li></ul>
    <ul data-l="en" lang="en" hidden>${links("en")}<li><a href="index.html">Home</a></li></ul>
  </nav>
</footer>
<script src="js/legal.js"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(__dirname, "public", name), html);
  console.log(name);
});
