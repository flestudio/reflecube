{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nix-vite-plus = {
      url = "github:ryoppippi/nix-vite-plus";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    agent-skills = {
      url = "github:Kyure-A/agent-skills-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    cloudflare-skills = {
      url = "github:cloudflare/skills";
      flake = false;
    };
  };

  outputs =
    {
      nixpkgs,
      nix-vite-plus,
      agent-skills,
      cloudflare-skills,
      ...
    }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});

      agentLib = agent-skills.lib.agent-skills;
      sources.cloudflare = {
        path = cloudflare-skills;
        subdir = "skills";
      };
      selection = agentLib.selectSkills {
        inherit sources;
        catalog = agentLib.discoverCatalog sources;
        allowlist = [
          "cf-cli"
          "workers-best-practices"
        ];
      };
    in
    {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = [
            pkgs.nodejs-slim_26
            (pkgs.pnpm.override { nodejs-slim = pkgs.nodejs-slim_26; })
            nix-vite-plus.packages.${pkgs.stdenv.hostPlatform.system}.vp
          ];
          shellHook = ''
            export SSL_CERT_FILE="${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
            export NIX_SSL_CERT_FILE="$SSL_CERT_FILE"
            ${agentLib.mkShellHook {
              inherit pkgs;
              bundle = agentLib.mkBundle { inherit pkgs selection; };
              targets.claude = agentLib.defaultLocalTargets.claude // {
                enable = true;
              };
              quiet = true;
            }}
          '';
        };
      });

      formatter = forAllSystems (pkgs: pkgs.nixfmt-tree);
    };
}
