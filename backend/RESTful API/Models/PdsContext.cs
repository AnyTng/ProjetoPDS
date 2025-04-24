using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace RESTful_API.Models;

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

    public virtual DbSet<Cliente> Clientes { get; set; }

    public virtual DbSet<CodigoPostal> CodigoPostals { get; set; }

    public virtual DbSet<Contestacao> Contestacaos { get; set; }

    public virtual DbSet<Despesa> Despesas { get; set; }

    public virtual DbSet<Empresa> Empresas { get; set; }

    public virtual DbSet<Infracao> Infracoes { get; set; }

    public virtual DbSet<Login> Logins { get; set; }

    public virtual DbSet<Manutencao> Manutencaos { get; set; }

    public virtual DbSet<MarcaVeiculo> MarcaVeiculos { get; set; }

    public virtual DbSet<ModeloVeiculo> ModeloVeiculos { get; set; }

    public virtual DbSet<Notificacao> Notificacaos { get; set; }

    public virtual DbSet<Recibo> Recibos { get; set; }

    public virtual DbSet<Seguradora> Seguradoras { get; set; }

    public virtual DbSet<Seguro> Seguros { get; set; }

    public virtual DbSet<TipoLogin> TipoLogins { get; set; }

    public virtual DbSet<Veiculo> Veiculos { get; set; }



    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Admin>(entity =>
        {
            entity.HasKey(e => e.Idadmin).HasName("PK__Admin__D704F3E8DFFD35F8");

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
            entity.HasKey(e => e.Idaluguer).HasName("PK__Aluguer__990E4C84AEB27E82");

            entity.ToTable("Aluguer");

            entity.Property(e => e.Idaluguer).HasColumnName("IDAluguer");
            entity.Property(e => e.ClienteIdcliente).HasColumnName("ClienteIDCliente");
            entity.Property(e => e.DataDevolucao).HasColumnType("datetime");
            entity.Property(e => e.DataEntregaPrevista).HasColumnType("datetime");
            entity.Property(e => e.DataFatura).HasColumnType("datetime");
            entity.Property(e => e.DataLevantamento).HasColumnType("datetime");
            entity.Property(e => e.VeiculoIdveiculo).HasColumnName("VeiculoIDVeiculo");

            entity.HasOne(d => d.ClienteIdclienteNavigation).WithMany(p => p.Aluguers)
                .HasForeignKey(d => d.ClienteIdcliente)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKAluguer126813");

            entity.HasOne(d => d.VeiculoIdveiculoNavigation).WithMany(p => p.Aluguers)
                .HasForeignKey(d => d.VeiculoIdveiculo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKAluguer611878");
        });

        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.HasKey(e => e.Idcliente).HasName("PK__Cliente__9B8553FC4D2E2B35");

            entity.ToTable("Cliente");

            entity.Property(e => e.Idcliente).HasColumnName("IDCliente");
            entity.Property(e => e.CodigoPostalCp).HasColumnName("CodigoPostalCP");
            entity.Property(e => e.DataNascCliente).HasColumnType("datetime");
            entity.Property(e => e.EstadoValCc).HasColumnName("EstadoValCC");
            entity.Property(e => e.LoginIdlogin).HasColumnName("LoginIDLogin");
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

            entity.HasOne(d => d.LoginIdloginNavigation).WithMany(p => p.Clientes)
                .HasForeignKey(d => d.LoginIdlogin)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKCliente791301");
        });

        modelBuilder.Entity<CodigoPostal>(entity =>
        {
            entity.HasKey(e => e.Cp).HasName("PK__CodigoPo__32149A72FAE11843");

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
            entity.HasKey(e => e.Idcontestacao).HasName("PK__Contesta__14B738BB2FC16872");

            entity.ToTable("Contestacao");

            entity.Property(e => e.Idcontestacao).HasColumnName("IDContestacao");
            entity.Property(e => e.ClienteIdcliente).HasColumnName("ClienteIDCliente");
            entity.Property(e => e.DescContestacao)
                .HasMaxLength(5000)
                .IsUnicode(false);
            entity.Property(e => e.EstadoContestacao)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.InfracoesIdinfracao).HasColumnName("InfracoesIDInfracao");

            entity.HasOne(d => d.ClienteIdclienteNavigation).WithMany(p => p.Contestacaos)
                .HasForeignKey(d => d.ClienteIdcliente)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKContestaca259049");

            entity.HasOne(d => d.InfracoesIdinfracaoNavigation).WithMany(p => p.Contestacaos)
                .HasForeignKey(d => d.InfracoesIdinfracao)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKContestaca219735");
        });

        modelBuilder.Entity<Despesa>(entity =>
        {
            entity.HasKey(e => e.Iddespesa).HasName("PK__Despesa__973F313F5B32D50F");

            entity.ToTable("Despesa");

            entity.Property(e => e.Iddespesa).HasColumnName("IDDespesa");
            entity.Property(e => e.DataPagDes).HasColumnType("datetime");
            entity.Property(e => e.DescTdespesa)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("DescTDespesa");
            entity.Property(e => e.VeiculoIdveiculo).HasColumnName("VeiculoIDVeiculo");

            entity.HasOne(d => d.VeiculoIdveiculoNavigation).WithMany(p => p.Despesas)
                .HasForeignKey(d => d.VeiculoIdveiculo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKDespesa903685");
        });

        modelBuilder.Entity<Empresa>(entity =>
        {
            entity.HasKey(e => e.Idempresa).HasName("PK__Empresa__ED09F0D50EA3BE9D");

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

        modelBuilder.Entity<Infracao>(entity =>
        {
            entity.HasKey(e => e.Idinfracao).HasName("PKInfracoe06C23E04392EB879");

            entity.Property(e => e.Idinfracao).HasColumnName("IDInfracao");
            entity.Property(e => e.AluguerIdaluguer).HasColumnName("AluguerIDAluguer");
            entity.Property(e => e.DataInfracao).HasColumnType("datetime");
            entity.Property(e => e.EstadoInfracao).HasColumnType("string");
            entity.Property(e => e.DescInfracao)
                .HasMaxLength(8000)
                .IsUnicode(false);

            entity.HasOne(d => d.AluguerIdaluguerNavigation).WithMany(p => p.Infracos)
                .HasForeignKey(d => d.AluguerIdaluguer)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKInfracoes593877");
        });

        modelBuilder.Entity<Login>(entity =>
        {
            entity.HasKey(e => e.Idlogin).HasName("PK__Login__EB32BAADA0B25ACD");

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
            entity.HasKey(e => e.Idmanutencao).HasName("PK__Manutenc__CC5FA919BFC3264A");

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
            entity.HasKey(e => e.Idmarca).HasName("PK__MarcaVei__CEC375E710F57997");

            entity.ToTable("MarcaVeiculo");

            entity.Property(e => e.Idmarca).HasColumnName("IDMarca");
            entity.Property(e => e.DescMarca)
                .HasMaxLength(20)
                .IsUnicode(false);
        });

        modelBuilder.Entity<ModeloVeiculo>(entity =>
        {
            entity.HasKey(e => e.Idmodelo).HasName("PK__ModeloVe__A33B9CD6CCF2F15B");

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

        modelBuilder.Entity<Notificacao>(entity =>
        {
            entity.HasKey(e => e.Idnotif).HasName("PK__Notifica__63BC33BD52AB7A99");

            entity.ToTable("Notificacao");

            entity.Property(e => e.Idnotif).HasColumnName("IDNotif");
            entity.Property(e => e.ConteudoNotif)
                .HasMaxLength(8000)
                .IsUnicode(false);
            entity.Property(e => e.LoginIdlogin).HasColumnName("LoginIDLogin");

            entity.HasOne(d => d.LoginIdloginNavigation).WithMany(p => p.Notificacaos)
                .HasForeignKey(d => d.LoginIdlogin)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKNotificaca156745");
        });

        modelBuilder.Entity<Recibo>(entity =>
        {
            entity.HasKey(e => e.Idrecibo).HasName("PK__Recibo__98176A8669C89B46");

            entity.ToTable("Recibo");

            entity.Property(e => e.Idrecibo).HasColumnName("IDRecibo");
            entity.Property(e => e.AluguerIdaluguer).HasColumnName("AluguerIDAluguer");
            entity.Property(e => e.DataRecibo).HasColumnType("datetime");
            entity.Property(e => e.TipoPagamento)
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.HasOne(d => d.AluguerIdaluguerNavigation).WithMany(p => p.Recibos)
                .HasForeignKey(d => d.AluguerIdaluguer)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKRecibo667234");
        });

        modelBuilder.Entity<Seguradora>(entity =>
        {
            entity.HasKey(e => e.Idseguradora).HasName("PK__Segurado__1A6E949C822C087A");

            entity.ToTable("Seguradora");

            entity.Property(e => e.Idseguradora).HasColumnName("IDSeguradora");
            entity.Property(e => e.DescSeguradora)
                .HasMaxLength(100)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Seguro>(entity =>
        {
            entity.HasKey(e => e.ApoliceSeguro).HasName("PK__Seguro__8F4F4D5A30FA1841");

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

        modelBuilder.Entity<TipoLogin>(entity =>
        {
            entity.HasKey(e => e.Idtlogin).HasName("PK__TipoLogi__ED4F671AD4B1F318");

            entity.ToTable("TipoLogin");

            entity.Property(e => e.Idtlogin).HasColumnName("IDTLogin");
            entity.Property(e => e.Tlogin)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("TLogin");
        });

        modelBuilder.Entity<Veiculo>(entity =>
        {
            entity.HasKey(e => e.Idveiculo).HasName("PK__Veiculo__238E4461B12E4F66");

            entity.ToTable("Veiculo");

            entity.Property(e => e.Idveiculo).HasColumnName("IDVeiculo");
            entity.Property(e => e.CaminhoFotoVeiculo)
                .HasMaxLength(8000)
                .IsUnicode(false);
            entity.Property(e => e.DataAquisicao).HasColumnType("datetime");
            entity.Property(e => e.DataFabricacao).HasColumnType("datetime");
            entity.Property(e => e.DataLegal).HasColumnType("datetime");
            entity.Property(e => e.DescCor)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.DescVeiculo)
                .HasMaxLength(8000)
                .IsUnicode(false);
            entity.Property(e => e.MatriculaVeiculo)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.ModeloVeiculoIdmodelo).HasColumnName("ModeloVeiculoIDModelo");

            entity.HasOne(d => d.ModeloVeiculoIdmodeloNavigation).WithMany(p => p.Veiculos)
                .HasForeignKey(d => d.ModeloVeiculoIdmodelo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FKVeiculo296432");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
