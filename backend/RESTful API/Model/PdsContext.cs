using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace RESTful_API.Model;

public partial class PdsContext : DbContext
{
    public PdsContext()
    {
    }

    public PdsContext(DbContextOptions<PdsContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Admin> Admins { get; set; }

    public virtual DbSet<Aluguer> Aluguers { get; set; }

    public virtual DbSet<ClasseVeiculo> ClasseVeiculos { get; set; }

    public virtual DbSet<Cliente> Clientes { get; set; }

    public virtual DbSet<CodigoPostal> CodigoPostals { get; set; }

    public virtual DbSet<Contestacao> Contestacaos { get; set; }

    public virtual DbSet<Despesa> Despesas { get; set; }

    public virtual DbSet<Empresa> Empresas { get; set; }

    public virtual DbSet<EstadoContestacao> EstadoContestacaos { get; set; }

    public virtual DbSet<EstadoVeiculo> EstadoVeiculos { get; set; }

    public virtual DbSet<Feedback> Feedbacks { get; set; }

    public virtual DbSet<HabilitacaoCliente> HabilitacaoClientes { get; set; }

    public virtual DbSet<Infraco> Infracoes { get; set; }

    public virtual DbSet<Login> Logins { get; set; }

    public virtual DbSet<Manutencao> Manutencaos { get; set; }

    public virtual DbSet<MarcaVeiculo> MarcaVeiculos { get; set; }

    public virtual DbSet<ModeloVeiculo> ModeloVeiculos { get; set; }

    public virtual DbSet<Orcamento> Orcamentos { get; set; }

    public virtual DbSet<Recibo> Recibos { get; set; }

    public virtual DbSet<Seguradora> Seguradoras { get; set; }

    public virtual DbSet<Seguro> Seguros { get; set; }

    public virtual DbSet<TipoDespesa> TipoDespesas { get; set; }

    public virtual DbSet<TipoInfracao> TipoInfracaos { get; set; }

    public virtual DbSet<TipoLogin> TipoLogins { get; set; }

    public virtual DbSet<TipoPagamento> TipoPagamentos { get; set; }

    public virtual DbSet<Veiculo> Veiculos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Admin>(entity =>
        {
            entity.HasKey(e => e.Idadmin).HasName("PK__Admin__D704F3E8990859DF");

            entity.ToTable("Admin");

            entity.Property(e => e.Idadmin).HasColumnName("IDAdmin");
            entity.Property(e => e.LoginIdlogin).HasColumnName("LoginIDLogin");
            entity.Property(e => e.NomeAdmin)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.LoginIdloginNavigation).WithMany(p => p.Admins)
                .HasForeignKey(d => d.LoginIdlogin)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKAdmin335875");
        });

        modelBuilder.Entity<Aluguer>(entity =>
        {
            entity.HasKey(e => e.Idaluguer).HasName("PK__Aluguer__990E4C8476DF0F2C");

            entity.ToTable("Aluguer");

            entity.Property(e => e.Idaluguer).HasColumnName("IDAluguer");
            entity.Property(e => e.ClienteIdcliente).HasColumnName("ClienteIDCliente");
            entity.Property(e => e.DataDevolucao).HasColumnType("datetime");
            entity.Property(e => e.DataEntregaPrevista).HasColumnType("datetime");
            entity.Property(e => e.DataFatura).HasColumnType("datetime");
            entity.Property(e => e.DataLevantamento).HasColumnType("datetime");
            entity.Property(e => e.OrcamentoIdorcamento).HasColumnName("OrcamentoIDOrcamento");
            entity.Property(e => e.VeiculoIdveiculo).HasColumnName("VeiculoIDVeiculo");

            entity.HasOne(d => d.ClienteIdclienteNavigation).WithMany(p => p.Aluguers)
                .HasForeignKey(d => d.ClienteIdcliente)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKAluguer126813");

            entity.HasOne(d => d.OrcamentoIdorcamentoNavigation).WithMany(p => p.Aluguers)
                .HasForeignKey(d => d.OrcamentoIdorcamento)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKAluguer853729");

            entity.HasOne(d => d.VeiculoIdveiculoNavigation).WithMany(p => p.Aluguers)
                .HasForeignKey(d => d.VeiculoIdveiculo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKAluguer611878");
        });

        modelBuilder.Entity<ClasseVeiculo>(entity =>
        {
            entity.HasKey(e => e.IdclasseVeiculo).HasName("PK__ClasseVe__CD827140D0C93F55");

            entity.ToTable("ClasseVeiculo");

            entity.Property(e => e.IdclasseVeiculo).HasColumnName("IDClasseVeiculo");
            entity.Property(e => e.DescClasseVeiculo)
                .HasMaxLength(110)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.HasKey(e => e.Idcliente).HasName("PK__Cliente__9B8553FC0F489E6E");

            entity.ToTable("Cliente");

            entity.Property(e => e.Idcliente).HasColumnName("IDCliente");
            entity.Property(e => e.CodigoPostalCp).HasColumnName("CodigoPostalCP");
            entity.Property(e => e.DataNascCliente).HasColumnType("datetime");
            entity.Property(e => e.Nifcliente).HasColumnName("NIFCliente");
            entity.Property(e => e.NomeCliente)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.RuaCliente)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.CodigoPostalCpNavigation).WithMany(p => p.Clientes)
                .HasForeignKey(d => d.CodigoPostalCp)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKCliente381375");

        });

        modelBuilder.Entity<CodigoPostal>(entity =>
        {
            entity.HasKey(e => e.Cp).HasName("PK__CodigoPo__32149A722858D7A0");

            entity.ToTable("CodigoPostal");

            entity.Property(e => e.Cp)
                .ValueGeneratedNever()
                .HasColumnName("CP");
            entity.Property(e => e.Localidade)
                .HasMaxLength(255)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Contestacao>(entity =>
        {
            entity.HasKey(e => new { e.InfracoesIdinfracao, e.EstadoContestacaoIdestadoC }).HasName("PK__Contesta__C208F45AAC97D41D");

            entity.ToTable("Contestacao");

            entity.Property(e => e.InfracoesIdinfracao).HasColumnName("InfracoesIDInfracao");
            entity.Property(e => e.EstadoContestacaoIdestadoC).HasColumnName("EstadoContestacaoIDEstadoC");
            entity.Property(e => e.ClienteIdcliente).HasColumnName("ClienteIDCliente");
            entity.Property(e => e.DescContestacao)
                .HasMaxLength(5000)
                .IsUnicode(false);

            entity.HasOne(d => d.ClienteIdclienteNavigation).WithMany(p => p.Contestacaos)
                .HasForeignKey(d => d.ClienteIdcliente)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKContestaca259049");

            entity.HasOne(d => d.EstadoContestacaoIdestadoCNavigation).WithMany(p => p.Contestacaos)
                .HasForeignKey(d => d.EstadoContestacaoIdestadoC)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKContestaca777898");

            entity.HasOne(d => d.InfracoesIdinfracaoNavigation).WithMany(p => p.Contestacaos)
                .HasForeignKey(d => d.InfracoesIdinfracao)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKContestaca219735");
        });

        modelBuilder.Entity<Despesa>(entity =>
        {
            entity.HasKey(e => e.Iddespesa).HasName("PK__Despesa__973F313F5735D18C");

            entity.ToTable("Despesa");

            entity.Property(e => e.Iddespesa).HasColumnName("IDDespesa");
            entity.Property(e => e.DataPagDes).HasColumnType("datetime");
            entity.Property(e => e.TipoDespesaIdtdespesa).HasColumnName("TipoDespesaIDTDespesa");
            entity.Property(e => e.VeiculoIdveiculo).HasColumnName("VeiculoIDVeiculo");

            entity.HasOne(d => d.TipoDespesaIdtdespesaNavigation).WithMany(p => p.Despesas)
                .HasForeignKey(d => d.TipoDespesaIdtdespesa)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKDespesa591382");

            entity.HasOne(d => d.VeiculoIdveiculoNavigation).WithMany(p => p.Despesas)
                .HasForeignKey(d => d.VeiculoIdveiculo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKDespesa903685");
        });

        modelBuilder.Entity<Empresa>(entity =>
        {
            entity.HasKey(e => e.Idempresa).HasName("PK__Empresa__ED09F0D5EB382642");

            entity.ToTable("Empresa");

            entity.Property(e => e.Idempresa).HasColumnName("IDEmpresa");
            entity.Property(e => e.CodigoPostalCp).HasColumnName("CodigoPostalCP");
            entity.Property(e => e.FuncionarioEmpresa)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.LoginIdlogin).HasColumnName("LoginIDLogin");
            entity.Property(e => e.NomeEmpresa)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.RuaEmpresa)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.CodigoPostalCpNavigation).WithMany(p => p.Empresas)
                .HasForeignKey(d => d.CodigoPostalCp)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKEmpresa862944");

            entity.HasOne(d => d.LoginIdloginNavigation).WithMany(p => p.Empresas)
                .HasForeignKey(d => d.LoginIdlogin)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKEmpresa698719");
        });

        modelBuilder.Entity<EstadoContestacao>(entity =>
        {
            entity.HasKey(e => e.IdestadoC).HasName("PK__EstadoCo__780DFEC464B8C2F1");

            entity.ToTable("EstadoContestacao");

            entity.Property(e => e.IdestadoC).HasColumnName("IDEstadoC");
            entity.Property(e => e.DescEstadoC)
                .HasMaxLength(100)
                .IsUnicode(false);
        });

        modelBuilder.Entity<EstadoVeiculo>(entity =>
        {
            entity.HasKey(e => e.IdestadoVeiculo).HasName("PK__EstadoVe__F1EB44DAEBEF9FFF");

            entity.ToTable("EstadoVeiculo");

            entity.Property(e => e.IdestadoVeiculo).HasColumnName("IDEstadoVeiculo");
            entity.Property(e => e.DescEstado)
                .HasMaxLength(100)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.Idfeedback).HasName("PK__Feedback__8456A50A6EFD0D3A");

            entity.ToTable("Feedback");

            entity.Property(e => e.Idfeedback).HasColumnName("IDFeedback");
            entity.Property(e => e.AluguerIdaluguer).HasColumnName("AluguerIDAluguer");
            entity.Property(e => e.DescOpiniao)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.AluguerIdaluguerNavigation).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.AluguerIdaluguer)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKFeedback112009");
        });

        modelBuilder.Entity<HabilitacaoCliente>(entity =>
        {
            entity.HasKey(e => new { e.ClienteIdcliente, e.ClasseVeiculoIdclasseVeiculo }).HasName("PK__Habilita__064B5447FE5D2E90");

            entity.ToTable("HabilitacaoCliente");

            entity.Property(e => e.ClienteIdcliente).HasColumnName("ClienteIDCliente");
            entity.Property(e => e.ClasseVeiculoIdclasseVeiculo).HasColumnName("ClasseVeiculoIDClasseVeiculo");
            entity.Property(e => e.DataHabilitacao).HasColumnType("datetime");

            entity.HasOne(d => d.ClasseVeiculoIdclasseVeiculoNavigation).WithMany(p => p.HabilitacaoClientes)
                .HasForeignKey(d => d.ClasseVeiculoIdclasseVeiculo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKHabilitaca889015");

            entity.HasOne(d => d.ClienteIdclienteNavigation).WithMany(p => p.HabilitacaoClientes)
                .HasForeignKey(d => d.ClienteIdcliente)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKHabilitaca740063");
        });

        modelBuilder.Entity<Infraco>(entity =>
        {
            entity.HasKey(e => e.Idinfracao).HasName("PK__Infracoe__06C23E04B364EFA0");

            entity.Property(e => e.Idinfracao).HasColumnName("IDInfracao");
            entity.Property(e => e.AluguerIdaluguer).HasColumnName("AluguerIDAluguer");
            entity.Property(e => e.DataInfracao).HasColumnType("datetime");
            entity.Property(e => e.TipoInfracaoIdtinfracao).HasColumnName("TipoInfracaoIDTInfracao");

            entity.HasOne(d => d.AluguerIdaluguerNavigation).WithMany(p => p.Infracos)
                .HasForeignKey(d => d.AluguerIdaluguer)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKInfracoes593877");

            entity.HasOne(d => d.TipoInfracaoIdtinfracaoNavigation).WithMany(p => p.Infracos)
                .HasForeignKey(d => d.TipoInfracaoIdtinfracao)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKInfracoes818361");
        });

        modelBuilder.Entity<Login>(entity =>
        {
            entity.HasKey(e => e.Idlogin).HasName("PK__Login__EB32BAAD93B41353");

            entity.ToTable("Login");

            entity.Property(e => e.Idlogin).HasColumnName("IDLogin");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.HashPassword)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.TipoLoginIdtlogin).HasColumnName("TipoLoginIDTLogin");

            entity.HasOne(d => d.TipoLoginIdtloginNavigation).WithMany(p => p.Logins)
                .HasForeignKey(d => d.TipoLoginIdtlogin)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKLogin479798");
        });

        modelBuilder.Entity<Manutencao>(entity =>
        {
            entity.HasKey(e => e.Idmanutencao).HasName("PK__Manutenc__CC5FA9190D922F78");

            entity.ToTable("Manutencao");

            entity.Property(e => e.Idmanutencao).HasColumnName("IDManutencao");
            entity.Property(e => e.CaminhoPdf)
                .HasMaxLength(8000)
                .IsUnicode(false)
                .HasColumnName("CaminhoPDF");
            entity.Property(e => e.DataManutencao).HasColumnType("datetime");
            entity.Property(e => e.DescManutencao)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.DespesaIddespesa).HasColumnName("DespesaIDDespesa");
            entity.Property(e => e.EmpresaIdempresa).HasColumnName("EmpresaIDEmpresa");
            entity.Property(e => e.VeiculoIdveiculo).HasColumnName("VeiculoIDVeiculo");

            entity.HasOne(d => d.DespesaIddespesaNavigation).WithMany(p => p.Manutencaos)
                .HasForeignKey(d => d.DespesaIddespesa)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKManutencao936421");

            entity.HasOne(d => d.EmpresaIdempresaNavigation).WithMany(p => p.Manutencaos)
                .HasForeignKey(d => d.EmpresaIdempresa)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKManutencao579084");
        });

        modelBuilder.Entity<MarcaVeiculo>(entity =>
        {
            entity.HasKey(e => e.Idmarca).HasName("PK__MarcaVei__CEC375E7440458FD");

            entity.ToTable("MarcaVeiculo");

            entity.Property(e => e.Idmarca).HasColumnName("IDMarca");
            entity.Property(e => e.DescMarca)
                .HasMaxLength(20)
                .IsUnicode(false);
        });

        modelBuilder.Entity<ModeloVeiculo>(entity =>
        {
            entity.HasKey(e => e.Idmodelo).HasName("PK__ModeloVe__A33B9CD683D5E1F9");

            entity.ToTable("ModeloVeiculo");

            entity.Property(e => e.Idmodelo).HasColumnName("IDModelo");
            entity.Property(e => e.DescModelo)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.MarcaVeiculoIdmarca).HasColumnName("MarcaVeiculoIDMarca");

            entity.HasOne(d => d.MarcaVeiculoIdmarcaNavigation).WithMany(p => p.ModeloVeiculos)
                .HasForeignKey(d => d.MarcaVeiculoIdmarca)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKModeloVeic760930");
        });

        modelBuilder.Entity<Orcamento>(entity =>
        {
            entity.HasKey(e => e.Idorcamento).HasName("PK__Orcament__5751B4A2511B1A4A");

            entity.ToTable("Orcamento");

            entity.Property(e => e.Idorcamento).HasColumnName("IDOrcamento");
        });

        modelBuilder.Entity<Recibo>(entity =>
        {
            entity.HasKey(e => e.Idrecibo).HasName("PK__Recibo__98176A86121EA2B1");

            entity.ToTable("Recibo");

            entity.Property(e => e.Idrecibo).HasColumnName("IDRecibo");
            entity.Property(e => e.AluguerIdaluguer).HasColumnName("AluguerIDAluguer");
            entity.Property(e => e.DataRecibo).HasColumnType("datetime");
            entity.Property(e => e.FaturaIdfatura).HasColumnName("FaturaIDFatura");
            entity.Property(e => e.TipoPagamentoIdtpagamento).HasColumnName("TipoPagamentoIDTPagamento");

            entity.HasOne(d => d.AluguerIdaluguerNavigation).WithMany(p => p.Recibos)
                .HasForeignKey(d => d.AluguerIdaluguer)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKRecibo667234");

            entity.HasOne(d => d.TipoPagamentoIdtpagamentoNavigation).WithMany(p => p.Recibos)
                .HasForeignKey(d => d.TipoPagamentoIdtpagamento)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKRecibo356624");
        });

        modelBuilder.Entity<Seguradora>(entity =>
        {
            entity.HasKey(e => e.Idseguradora).HasName("PK__Segurado__1A6E949C08D07722");

            entity.ToTable("Seguradora");

            entity.Property(e => e.Idseguradora).HasColumnName("IDSeguradora");
            entity.Property(e => e.DescSeguradora)
                .HasMaxLength(100)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Seguro>(entity =>
        {
            entity.HasKey(e => e.ApoliceSeguro).HasName("PK__Seguro__8F4F4D5A75AE906B");

            entity.ToTable("Seguro");

            entity.Property(e => e.ApoliceSeguro)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.DataRenovacao).HasColumnType("datetime");
            entity.Property(e => e.DescSeguro)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.SeguradoraIdseguradora).HasColumnName("SeguradoraIDSeguradora");
            entity.Property(e => e.VeiculoIdveiculo).HasColumnName("VeiculoIDVeiculo");

            entity.HasOne(d => d.SeguradoraIdseguradoraNavigation).WithMany(p => p.Seguros)
                .HasForeignKey(d => d.SeguradoraIdseguradora)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKSeguro155812");

            entity.HasOne(d => d.VeiculoIdveiculoNavigation).WithMany(p => p.Seguros)
                .HasForeignKey(d => d.VeiculoIdveiculo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKSeguro688000");
        });

        modelBuilder.Entity<TipoDespesa>(entity =>
        {
            entity.HasKey(e => e.Idtdespesa).HasName("PK__TipoDesp__7AD36DBDCB28AE6B");

            entity.ToTable("TipoDespesa");

            entity.Property(e => e.Idtdespesa).HasColumnName("IDTDespesa");
            entity.Property(e => e.DescTdespesa)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("DescTDespesa");
        });

        modelBuilder.Entity<TipoInfracao>(entity =>
        {
            entity.HasKey(e => e.Idtinfracao).HasName("PK__TipoInfr__CD4CBA55BFE586F9");

            entity.ToTable("TipoInfracao");

            entity.Property(e => e.Idtinfracao).HasColumnName("IDTInfracao");
            entity.Property(e => e.DescTinfracao)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("DescTInfracao");
        });

        modelBuilder.Entity<TipoLogin>(entity =>
        {
            entity.HasKey(e => e.Idtlogin).HasName("PK__TipoLogi__ED4F671AEEC816B9");

            entity.ToTable("TipoLogin");

            entity.Property(e => e.Idtlogin).HasColumnName("IDTLogin");
            entity.Property(e => e.Tlogin)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("TLogin");
        });

        modelBuilder.Entity<TipoPagamento>(entity =>
        {
            entity.HasKey(e => e.Idtpagamento).HasName("PK__TipoPaga__F34392C6BB0FA619");

            entity.ToTable("TipoPagamento");

            entity.Property(e => e.Idtpagamento).HasColumnName("IDTPagamento");
            entity.Property(e => e.DescTpagamento)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("DescTPagamento");
        });

        modelBuilder.Entity<Veiculo>(entity =>
        {
            entity.HasKey(e => e.Idveiculo).HasName("PK__Veiculo__238E4461EC7BEE9C");

            entity.ToTable("Veiculo");

            entity.Property(e => e.Idveiculo).HasColumnName("IDVeiculo");
            entity.Property(e => e.CaminhoFotoVeiculo)
                .HasMaxLength(8000)
                .IsUnicode(false);
            entity.Property(e => e.ClasseVeiculoIdclasseVeiculo).HasColumnName("ClasseVeiculoIDClasseVeiculo");
            entity.Property(e => e.DataAquisicao).HasColumnType("datetime");
            entity.Property(e => e.DataFabricacao).HasColumnType("datetime");
            entity.Property(e => e.DataLegal).HasColumnType("datetime");
            entity.Property(e => e.DescCor)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.EstadoVeiculoIdestadoVeiculo).HasColumnName("EstadoVeiculoIDEstadoVeiculo");
            entity.Property(e => e.MatriculaVeiculo)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.ModeloVeiculoIdmodelo).HasColumnName("ModeloVeiculoIDModelo");

            entity.HasOne(d => d.ClasseVeiculoIdclasseVeiculoNavigation).WithMany(p => p.Veiculos)
                .HasForeignKey(d => d.ClasseVeiculoIdclasseVeiculo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKVeiculo606370");

            entity.HasOne(d => d.EstadoVeiculoIdestadoVeiculoNavigation).WithMany(p => p.Veiculos)
                .HasForeignKey(d => d.EstadoVeiculoIdestadoVeiculo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKVeiculo314013");

            entity.HasOne(d => d.ModeloVeiculoIdmodeloNavigation).WithMany(p => p.Veiculos)
                .HasForeignKey(d => d.ModeloVeiculoIdmodelo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKVeiculo296432");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
