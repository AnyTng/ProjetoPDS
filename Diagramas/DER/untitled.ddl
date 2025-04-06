CREATE TABLE Cliente (
  IDCliente       int IDENTITY NOT NULL, 
  NomeCliente     varchar(255) NULL, 
  DataNascCliente datetime NULL, 
  NIFCliente      int NULL, 
  RuaCliente      varchar(255) NULL, 
  CodigoPostalCP  int NOT NULL, 
  LoginIDLogin    int NOT NULL, 
  CreditoCliente  float(10) NULL, 
  ContactoC1      int NULL, 
  ContactoC2      int NULL, 
  PRIMARY KEY (IDCliente));
CREATE TABLE Habilitacao (
  ClienteIDCliente int NOT NULL, 
  [Column]         int NULL);
CREATE TABLE ClasseVeiculo (
  IDClasseVeiculo   int IDENTITY NOT NULL, 
  DescClasseVeiculo varchar(110) NULL, 
  PRIMARY KEY (IDClasseVeiculo));
CREATE TABLE HabilitacaoCliente (
  ClienteIDCliente             int NOT NULL, 
  ClasseVeiculoIDClasseVeiculo int NOT NULL, 
  DataHabilitacao              datetime NULL, 
  PRIMARY KEY (ClienteIDCliente, 
  ClasseVeiculoIDClasseVeiculo));
CREATE TABLE CodigoPostal (
  CP         int IDENTITY NOT NULL, 
  Localidade varchar(255) NULL, 
  PRIMARY KEY (CP));
CREATE TABLE Veiculo (
  IDVeiculo                    int IDENTITY NOT NULL, 
  MatriculaVeiculo             varchar(10) NULL, 
  LotacaoVeiculo               int NULL, 
  TaraVeiculo                  int NULL, 
  DescCor                      varchar(255) NULL, 
  DataLegal                    datetime NULL, 
  DataFabricacao               datetime NULL, 
  DataAquisicao                datetime NULL, 
  ValorDiarioVeiculo           float(10) NULL, 
  ModeloVeiculoIDModelo        int NOT NULL, 
  ClasseVeiculoIDClasseVeiculo int NOT NULL, 
  EstadoVeiculoIDEstadoVeiculo int NOT NULL, 
  CaminhoFotoVeiculo           varchar(8000) NULL, 
  PRIMARY KEY (IDVeiculo));
CREATE TABLE Infracoes (
  IDInfracao              int IDENTITY NOT NULL, 
  TipoInfracaoIDTInfracao int NOT NULL, 
  AluguerIDAluguer        int NOT NULL, 
  DataInfracao            datetime NULL, 
  ValorInfracao           int NULL, 
  PRIMARY KEY (IDInfracao));
CREATE TABLE ModeloVeiculo (
  IDModelo            int IDENTITY NOT NULL, 
  DescModelo          varchar(20) NULL, 
  MarcaVeiculoIDMarca int NOT NULL, 
  PRIMARY KEY (IDModelo));
CREATE TABLE MarcaVeiculo (
  IDMarca   int IDENTITY NOT NULL, 
  DescMarca varchar(20) NULL, 
  PRIMARY KEY (IDMarca));
CREATE TABLE EstadoVeiculo (
  IDEstadoVeiculo int IDENTITY NOT NULL, 
  DescEstado      varchar(100) NULL, 
  PRIMARY KEY (IDEstadoVeiculo));
CREATE TABLE Seguro (
  ApoliceSeguro          varchar(20) NOT NULL, 
  DataRenovacao          datetime NULL, 
  ValorInicial           float(10) NULL, 
  DescSeguro             varchar(255) NULL, 
  SeguradoraIDSeguradora int NOT NULL, 
  VeiculoIDVeiculo       int NOT NULL, 
  PRIMARY KEY (ApoliceSeguro));
CREATE TABLE Despesa (
  VeiculoIDVeiculo      int NOT NULL, 
  TipoDespesaIDTDespesa int NOT NULL, 
  ValorDespesa          float(10) NULL, 
  DataPagDes            datetime NULL, 
  IDDespesa             int IDENTITY NOT NULL, 
  PRIMARY KEY (IDDespesa));
CREATE TABLE TipoDespesa (
  IDTDespesa   int IDENTITY NOT NULL, 
  DescTDespesa varchar(255) NULL, 
  PRIMARY KEY (IDTDespesa));
CREATE TABLE Seguradora (
  IDSeguradora   int IDENTITY NOT NULL, 
  DescSeguradora varchar(100) NULL, 
  PRIMARY KEY (IDSeguradora));
CREATE TABLE Aluguer (
  IDAluguer            int IDENTITY NOT NULL, 
  VeiculoIDVeiculo     int NOT NULL, 
  ClienteIDCliente     int NOT NULL, 
  DataLevantamento     datetime NULL, 
  DataEntregaPrevista  datetime NULL, 
  DataDevolucao        datetime NULL, 
  OrcamentoIDOrcamento int NOT NULL, 
  PRIMARY KEY (IDAluguer));
CREATE TABLE Orcamento (
  IDOrcamento   int IDENTITY NOT NULL, 
  ValorReserva  float(10) NULL, 
  ValorQuitacao float(10) NULL, 
  PRIMARY KEY (IDOrcamento));
CREATE TABLE TipoInfracao (
  IDTInfracao   int IDENTITY NOT NULL, 
  DescTInfracao varchar(255) NULL, 
  PRIMARY KEY (IDTInfracao));
CREATE TABLE Feedback (
  AluguerIDAluguer int NOT NULL, 
  Classificacao    float(1) NULL, 
  DescOpiniao      varchar(255) NULL);
CREATE TABLE Manutencao (
  IDManutencao     int IDENTITY NOT NULL, 
  DataManutencao   datetime NULL, 
  DescManutencao   varchar(255) NULL, 
  VeiculoIDVeiculo int NOT NULL, 
  EmpresaIDEmpresa int NOT NULL, 
  DespesaIDDespesa int NOT NULL, 
  PRIMARY KEY (IDManutencao));
CREATE TABLE Empresa (
  IDEmpresa          int IDENTITY NOT NULL, 
  FuncionarioEmpresa varchar(255) NULL, 
  NomeEmpresa        varchar(50) NULL, 
  NifEmpresa         int NULL, 
  RuaEmpresa         varchar(255) NULL, 
  CodigoPostalCP     int NOT NULL, 
  LoginIDLogin       int NOT NULL, 
  ContactoE1         int NULL, 
  ContactoE2         int NULL, 
  PRIMARY KEY (IDEmpresa));
CREATE TABLE Fatura (
  IDFatura             int IDENTITY NOT NULL, 
  AluguerIDAluguer     int NOT NULL, 
  OrcamentoIDOrcamento int NOT NULL, 
  DataFatura           datetime NULL, 
  PRIMARY KEY (IDFatura));
CREATE TABLE TipoPagamento (
  IDTPagamento   int IDENTITY NOT NULL, 
  DescTPagamento varchar(20) NULL, 
  PRIMARY KEY (IDTPagamento));
CREATE TABLE Recibo (
  FaturaIDFatura            int NOT NULL, 
  IDRecibo                  int IDENTITY NOT NULL, 
  DataRecibo                datetime NULL, 
  ValorRecibo               int NULL, 
  TipoPagamentoIDTPagamento int NOT NULL, 
  PRIMARY KEY (IDRecibo));
CREATE TABLE Admin (
  IDAdmin      int IDENTITY NOT NULL, 
  NomeAdmin    varchar(255) NULL, 
  NifAdmin     int NULL, 
  LoginIDLogin int NOT NULL, 
  PRIMARY KEY (IDAdmin));
CREATE TABLE FaturasManutencao (
  ManutencaoIDManutencao int NOT NULL, 
  CaminhoPDF             varchar(8000) NULL);
CREATE TABLE Login (
  IDLogin           int IDENTITY NOT NULL, 
  Email             varchar(255) NULL, 
  HashPassword      varchar(255) NULL, 
  TipoLoginIDTLogin int NOT NULL, 
  PRIMARY KEY (IDLogin));
CREATE TABLE TipoLogin (
  IDTLogin int IDENTITY NOT NULL, 
  TLogin   varchar(50) NULL, 
  PRIMARY KEY (IDTLogin));
CREATE TABLE Contestacao (
  InfracoesIDInfracao        int NOT NULL, 
  ClienteIDCliente           int NOT NULL, 
  DescContestacao            varchar(5000) NULL, 
  EstadoContestacaoIDEstadoC int NOT NULL);
CREATE TABLE EstadoContestacao (
  IDEstadoC   int IDENTITY NOT NULL, 
  DescEstadoC varchar(100) NULL, 
  PRIMARY KEY (IDEstadoC));
ALTER TABLE HabilitacaoCliente ADD CONSTRAINT FKHabilitaca740063 FOREIGN KEY (ClienteIDCliente) REFERENCES Cliente (IDCliente);
ALTER TABLE HabilitacaoCliente ADD CONSTRAINT FKHabilitaca889015 FOREIGN KEY (ClasseVeiculoIDClasseVeiculo) REFERENCES ClasseVeiculo (IDClasseVeiculo);
ALTER TABLE Cliente ADD CONSTRAINT FKCliente381375 FOREIGN KEY (CodigoPostalCP) REFERENCES CodigoPostal (CP);
ALTER TABLE Veiculo ADD CONSTRAINT FKVeiculo606370 FOREIGN KEY (ClasseVeiculoIDClasseVeiculo) REFERENCES ClasseVeiculo (IDClasseVeiculo);
ALTER TABLE Veiculo ADD CONSTRAINT FKVeiculo296432 FOREIGN KEY (ModeloVeiculoIDModelo) REFERENCES ModeloVeiculo (IDModelo);
ALTER TABLE ModeloVeiculo ADD CONSTRAINT FKModeloVeic760930 FOREIGN KEY (MarcaVeiculoIDMarca) REFERENCES MarcaVeiculo (IDMarca);
ALTER TABLE Veiculo ADD CONSTRAINT FKVeiculo314013 FOREIGN KEY (EstadoVeiculoIDEstadoVeiculo) REFERENCES EstadoVeiculo (IDEstadoVeiculo);
ALTER TABLE Despesa ADD CONSTRAINT FKDespesa903685 FOREIGN KEY (VeiculoIDVeiculo) REFERENCES Veiculo (IDVeiculo);
ALTER TABLE Despesa ADD CONSTRAINT FKDespesa591382 FOREIGN KEY (TipoDespesaIDTDespesa) REFERENCES TipoDespesa (IDTDespesa);
ALTER TABLE Seguro ADD CONSTRAINT FKSeguro155812 FOREIGN KEY (SeguradoraIDSeguradora) REFERENCES Seguradora (IDSeguradora);
ALTER TABLE Aluguer ADD CONSTRAINT FKAluguer611878 FOREIGN KEY (VeiculoIDVeiculo) REFERENCES Veiculo (IDVeiculo);
ALTER TABLE Aluguer ADD CONSTRAINT FKAluguer126813 FOREIGN KEY (ClienteIDCliente) REFERENCES Cliente (IDCliente);
ALTER TABLE Infracoes ADD CONSTRAINT FKInfracoes818361 FOREIGN KEY (TipoInfracaoIDTInfracao) REFERENCES TipoInfracao (IDTInfracao);
ALTER TABLE Infracoes ADD CONSTRAINT FKInfracoes593877 FOREIGN KEY (AluguerIDAluguer) REFERENCES Aluguer (IDAluguer);
ALTER TABLE Feedback ADD CONSTRAINT FKFeedback112009 FOREIGN KEY (AluguerIDAluguer) REFERENCES Aluguer (IDAluguer);
ALTER TABLE Empresa ADD CONSTRAINT FKEmpresa862944 FOREIGN KEY (CodigoPostalCP) REFERENCES CodigoPostal (CP);
ALTER TABLE Fatura ADD CONSTRAINT FKFatura941452 FOREIGN KEY (AluguerIDAluguer) REFERENCES Aluguer (IDAluguer);
ALTER TABLE Recibo ADD CONSTRAINT FKRecibo223264 FOREIGN KEY (FaturaIDFatura) REFERENCES Fatura (IDFatura);
ALTER TABLE Recibo ADD CONSTRAINT FKRecibo356624 FOREIGN KEY (TipoPagamentoIDTPagamento) REFERENCES TipoPagamento (IDTPagamento);
ALTER TABLE Manutencao ADD CONSTRAINT FKManutencao579084 FOREIGN KEY (EmpresaIDEmpresa) REFERENCES Empresa (IDEmpresa);
ALTER TABLE Manutencao ADD CONSTRAINT FKManutencao936421 FOREIGN KEY (DespesaIDDespesa) REFERENCES Despesa (IDDespesa);
ALTER TABLE FaturasManutencao ADD CONSTRAINT FKFaturasMan39946 FOREIGN KEY (ManutencaoIDManutencao) REFERENCES Manutencao (IDManutencao);
ALTER TABLE Seguro ADD CONSTRAINT FKSeguro688000 FOREIGN KEY (VeiculoIDVeiculo) REFERENCES Veiculo (IDVeiculo);
ALTER TABLE Cliente ADD CONSTRAINT FKCliente791301 FOREIGN KEY (LoginIDLogin) REFERENCES Login (IDLogin);
ALTER TABLE Empresa ADD CONSTRAINT FKEmpresa698719 FOREIGN KEY (LoginIDLogin) REFERENCES Login (IDLogin);
ALTER TABLE Admin ADD CONSTRAINT FKAdmin335875 FOREIGN KEY (LoginIDLogin) REFERENCES Login (IDLogin);
ALTER TABLE Login ADD CONSTRAINT FKLogin479798 FOREIGN KEY (TipoLoginIDTLogin) REFERENCES TipoLogin (IDTLogin);
ALTER TABLE Contestacao ADD CONSTRAINT FKContestaca219735 FOREIGN KEY (InfracoesIDInfracao) REFERENCES Infracoes (IDInfracao);
ALTER TABLE Contestacao ADD CONSTRAINT FKContestaca259049 FOREIGN KEY (ClienteIDCliente) REFERENCES Cliente (IDCliente);
ALTER TABLE Contestacao ADD CONSTRAINT FKContestaca777898 FOREIGN KEY (EstadoContestacaoIDEstadoC) REFERENCES EstadoContestacao (IDEstadoC);
ALTER TABLE Aluguer ADD CONSTRAINT FKAluguer853729 FOREIGN KEY (OrcamentoIDOrcamento) REFERENCES Orcamento (IDOrcamento);
