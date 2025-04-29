CREATE TABLE Cliente (
  IDCliente       int IDENTITY NOT NULL, 
  NomeCliente     varchar(255) NULL, 
  DataNascCliente datetime NULL, 
  NIFCliente      int NULL, 
  RuaCliente      varchar(255) NULL, 
  CodigoPostalCP  int NOT NULL, 
  LoginIDLogin    int NOT NULL, 
  ContactoC1      int NULL, 
  ContactoC2      int NULL, 
  EstadoValCC     bit NULL, 
  PRIMARY KEY (IDCliente));
CREATE TABLE Habilitacao (
  ClienteIDCliente int NOT NULL, 
  [Column]         int NULL);
CREATE TABLE CodigoPostal (
  CP         int IDENTITY NOT NULL, 
  Localidade varchar(255) NULL, 
  PRIMARY KEY (CP));
CREATE TABLE Veiculo (
  IDVeiculo             int IDENTITY NOT NULL, 
  MatriculaVeiculo      varchar(10) NULL, 
  LotacaoVeiculo        int NULL, 
  TaraVeiculo           int NULL, 
  DescCor               varchar(255) NULL, 
  DataLegal             datetime NULL, 
  DataFabricacao        datetime NULL, 
  DataAquisicao         datetime NULL, 
  ValorDiarioVeiculo    float(10) NULL, 
  ModeloVeiculoIDModelo int NOT NULL, 
  CaminhoFotoVeiculo    varchar(8000) NULL, 
  DescVeiculo           varchar(8000) NULL, 
  PRIMARY KEY (IDVeiculo));
CREATE TABLE Infracoes (
  IDInfracao       int IDENTITY NOT NULL, 
  AluguerIDAluguer int NOT NULL, 
  DataInfracao     datetime NULL, 
  ValorInfracao    int NULL, 
  DescInfracao     varchar(8000) NULL, 
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
CREATE TABLE Seguro (
  ApoliceSeguro          varchar(20) NOT NULL, 
  DataRenovacao          datetime NULL, 
  ValorInicial           float(10) NULL, 
  DescSeguro             varchar(255) NULL, 
  SeguradoraIDSeguradora int NOT NULL, 
  VeiculoIDVeiculo       int NOT NULL, 
  PRIMARY KEY (ApoliceSeguro));
CREATE TABLE Despesa (
  VeiculoIDVeiculo int NOT NULL, 
  ValorDespesa     float(10) NULL, 
  DataPagDes       datetime NULL, 
  DescTDespesa     varchar(255) NULL, 
  IDDespesa        int IDENTITY NOT NULL, 
  PRIMARY KEY (IDDespesa));
CREATE TABLE Seguradora (
  IDSeguradora   int IDENTITY NOT NULL, 
  DescSeguradora varchar(100) NULL, 
  PRIMARY KEY (IDSeguradora));
CREATE TABLE Aluguer (
  IDAluguer           int IDENTITY NOT NULL, 
  VeiculoIDVeiculo    int NOT NULL, 
  ClienteIDCliente    int NOT NULL, 
  DataLevantamento    datetime NULL, 
  DataEntregaPrevista datetime NULL, 
  DataDevolucao       datetime NULL, 
  DataFatura          datetime NULL, 
  Classificacao       float(1) NULL, 
  ValorReserva        float(10) NULL, 
  ValorQuitacao       float(10) NULL, 
  PRIMARY KEY (IDAluguer));
CREATE TABLE Manutencao (
  IDManutencao     int IDENTITY NOT NULL, 
  DataManutencao   datetime NULL, 
  DescManutencao   varchar(255) NULL, 
  VeiculoIDVeiculo int NOT NULL, 
  EmpresaIDEmpresa int NOT NULL, 
  DespesaIDDespesa int NOT NULL, 
  CaminhoPDF       varchar(8000) NULL, 
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
CREATE TABLE Recibo (
  IDRecibo         int IDENTITY NOT NULL, 
  DataRecibo       datetime NULL, 
  TipoPagamento    varchar(100) NOT NULL, 
  AluguerIDAluguer int NOT NULL, 
  PRIMARY KEY (IDRecibo));
CREATE TABLE Admin (
  IDAdmin      int IDENTITY NOT NULL, 
  NomeAdmin    varchar(255) NULL, 
  NifAdmin     int NULL, 
  LoginIDLogin int NOT NULL, 
  PRIMARY KEY (IDAdmin));
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
  InfracoesIDInfracao int NOT NULL, 
  ClienteIDCliente    int NOT NULL, 
  DescContestacao     varchar(5000) NULL, 
  EstadoContestacao   varchar(100) NOT NULL);
CREATE TABLE Notificacao (
  IDNotif       int IDENTITY NOT NULL, 
  ConteudoNotif varchar(8000) NULL, 
  LoginIDLogin  int NOT NULL, 
  PRIMARY KEY (IDNotif));
ALTER TABLE Cliente ADD CONSTRAINT FKCliente381375 FOREIGN KEY (CodigoPostalCP) REFERENCES CodigoPostal (CP);
ALTER TABLE Veiculo ADD CONSTRAINT FKVeiculo296432 FOREIGN KEY (ModeloVeiculoIDModelo) REFERENCES ModeloVeiculo (IDModelo);
ALTER TABLE ModeloVeiculo ADD CONSTRAINT FKModeloVeic760930 FOREIGN KEY (MarcaVeiculoIDMarca) REFERENCES MarcaVeiculo (IDMarca);
ALTER TABLE Despesa ADD CONSTRAINT FKDespesa903685 FOREIGN KEY (VeiculoIDVeiculo) REFERENCES Veiculo (IDVeiculo);
ALTER TABLE Seguro ADD CONSTRAINT FKSeguro155812 FOREIGN KEY (SeguradoraIDSeguradora) REFERENCES Seguradora (IDSeguradora);
ALTER TABLE Aluguer ADD CONSTRAINT FKAluguer611878 FOREIGN KEY (VeiculoIDVeiculo) REFERENCES Veiculo (IDVeiculo);
ALTER TABLE Aluguer ADD CONSTRAINT FKAluguer126813 FOREIGN KEY (ClienteIDCliente) REFERENCES Cliente (IDCliente);
ALTER TABLE Infracoes ADD CONSTRAINT FKInfracoes593877 FOREIGN KEY (AluguerIDAluguer) REFERENCES Aluguer (IDAluguer);
ALTER TABLE Empresa ADD CONSTRAINT FKEmpresa862944 FOREIGN KEY (CodigoPostalCP) REFERENCES CodigoPostal (CP);
ALTER TABLE Manutencao ADD CONSTRAINT FKManutencao579084 FOREIGN KEY (EmpresaIDEmpresa) REFERENCES Empresa (IDEmpresa);
ALTER TABLE Manutencao ADD CONSTRAINT FKManutencao936421 FOREIGN KEY (DespesaIDDespesa) REFERENCES Despesa (IDDespesa);
ALTER TABLE Seguro ADD CONSTRAINT FKSeguro688000 FOREIGN KEY (VeiculoIDVeiculo) REFERENCES Veiculo (IDVeiculo);
ALTER TABLE Cliente ADD CONSTRAINT FKCliente791301 FOREIGN KEY (LoginIDLogin) REFERENCES Login (IDLogin);
ALTER TABLE Empresa ADD CONSTRAINT FKEmpresa698719 FOREIGN KEY (LoginIDLogin) REFERENCES Login (IDLogin);
ALTER TABLE Admin ADD CONSTRAINT FKAdmin335875 FOREIGN KEY (LoginIDLogin) REFERENCES Login (IDLogin);
ALTER TABLE Login ADD CONSTRAINT FKLogin479798 FOREIGN KEY (TipoLoginIDTLogin) REFERENCES TipoLogin (IDTLogin);
ALTER TABLE Contestacao ADD CONSTRAINT FKContestaca219735 FOREIGN KEY (InfracoesIDInfracao) REFERENCES Infracoes (IDInfracao);
ALTER TABLE Contestacao ADD CONSTRAINT FKContestaca259049 FOREIGN KEY (ClienteIDCliente) REFERENCES Cliente (IDCliente);
ALTER TABLE Recibo ADD CONSTRAINT FKRecibo667234 FOREIGN KEY (AluguerIDAluguer) REFERENCES Aluguer (IDAluguer);
ALTER TABLE Notificacao ADD CONSTRAINT FKNotificaca156745 FOREIGN KEY (LoginIDLogin) REFERENCES Login (IDLogin);
